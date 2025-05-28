import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  Transaction,
  TransactionStatus,
} from '@/context/transaction/domain/transaction.entity';
import { TransactionRepository } from '../../domain/transaction.repository';
import { ProductRepository } from '@/context/product/domain/product.repository';
import { WompiService } from '@/context/shared/wompi/wompi.service';

export interface CreateTransactionRequest {
  productId: string;
  quantity: number;
  customerEmail: string;
  customerName?: string; // Received by use case, but not stored on Transaction entity
  customerPhone?: string; // Received by use case, but not stored on Transaction entity
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

export interface ProcessPaymentRequest {
  transactionId: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string; // MM/YY
  cvv: string;
}

// Interface for status updates (used by webhook)
export interface UpdateTransactionStatusRequest {
  transactionId: string; // Local DB transaction ID
  status: any; // Mapped status (e.g., TransactionStatus.APPROVED)
  wompiTransactionId: string; // Wompi's transaction ID
}

export interface UpdateWebHookRequest {
  reference: string;
  status: any;
}

@Injectable()
export class TransactionUseCases {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly productRepository: ProductRepository,
    private readonly wompiService: WompiService,
  ) {}

  async createTransaction(request: CreateTransactionRequest): Promise<{
    success: boolean;
    data?: {
      transactionId: string;
      reference: string;
      amount: number; // En pesos para frontend
      productName: string;
      quantity: number;
    };
    error?: string;
    message: string;
    statusCode: number;
  }> {
    try {
      const product = await this.productRepository.findById(request.productId);

      if (!product) {
        throw new BadRequestException('Product not found');
      }

      if (!product.hasStock(request.quantity)) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${product.stock}, Requested: ${request.quantity}`,
        );
      }

      const transactionEntityData = {
        productId: request.productId,
        productName: product.name,
        quantity: request.quantity,
        productPrice: product.price, // Price in cents from product
        customerEmail: request.customerEmail,
      };

      const transaction = Transaction.create(transactionEntityData);
      const savedTransaction = await this.transactionRepository.save(
        transaction,
        {
          cardHolder: request?.cardHolder,
          cardNumber: request?.cardNumber,
          cvv: request?.cvv,
          expiryDate: request?.expiryDate,
        },
      );

      return {
        success: true,
        data: {
          transactionId: savedTransaction.id,
          reference: savedTransaction.reference,
          amount: this.convertCentsToPesos(savedTransaction.amount),
          productName: savedTransaction.productName,
          quantity: savedTransaction.quantity,
        },
        message: 'Transaction created successfully.',
        statusCode: 201,
      };
    } catch (error) {
      const statusCode =
        error instanceof BadRequestException ||
        error instanceof NotFoundException
          ? error.getStatus()
          : 400;
      return {
        success: false,
        error: error.message,
        message: error.message || 'Error creating transaction',
        statusCode,
      };
    }
  }

  async getTransactionById(id: string): Promise<{
    success: boolean;
    data?: {
      id: string;
      reference: string;
      status: string;
      productName: string;
      quantity: number;
      amount: number; // En pesos para frontend
      subtotal: number; // En pesos
      baseFee: number; // En pesos (display value)
      deliveryFee: number; // En pesos (display value)
      customerEmail: string;
      // customerName and customerPhone are not on the Transaction entity, so not returned here
    };
    error?: string;
    message: string;
    statusCode: number;
  }> {
    try {
      const transaction = await this.transactionRepository.findById(id);
      if (!transaction) {
        return {
          success: false,
          error: 'Transaction not found',
          message: 'Transaction not found',
          statusCode: 404,
        };
      }

      // Fees used for original calculation (in cents)
      const calculatedBaseFeeCents = 500;
      // Determine calculated delivery fee based on how original amount was formed
      const originalSubtotalCents =
        transaction.amount -
        calculatedBaseFeeCents -
        (transaction.amount > 5000000 + calculatedBaseFeeCents ? 0 : 800);
      const calculatedDeliveryFeeCents =
        originalSubtotalCents > 5000000 ? 0 : 800;

      // Displayed fees in pesos (as per your original getTransactionById logic for display)
      const displayBaseFeePesos = 5000;
      const displayDeliveryFeePesos =
        transaction.amount > 5000000 + 500 ? 0 : 8000; // Match condition for 800 cents delivery fee

      return {
        success: true,
        data: {
          id: transaction.id,
          reference: transaction.reference,
          status: transaction.status,
          productName: transaction.productName,
          quantity: transaction.quantity,
          amount: this.convertCentsToPesos(transaction.amount),
          subtotal: this.convertCentsToPesos(
            transaction.amount -
              calculatedBaseFeeCents -
              calculatedDeliveryFeeCents,
          ),
          baseFee: displayBaseFeePesos,
          deliveryFee: displayDeliveryFeePesos,
          customerEmail: transaction.customerEmail,
        },
        message: 'Transaction retrieved successfully.',
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error fetching transaction',
        statusCode: 400,
      };
    }
  }

  async getTransactionByReferences(reference: string): Promise<{
    success: boolean;
    data?: {
      id: string;
      reference: string;
      status: string;
      productName: string;
      quantity: number;
      amount: number; // En pesos para frontend
      subtotal: number; // En pesos
      baseFee: number; // En pesos (display value)
      deliveryFee: number; // En pesos (display value)
      customerEmail: string;
      // customerName and customerPhone are not on the Transaction entity, so not returned here
    };
    error?: string;
    message: string;
    statusCode: number;
  }> {
    try {
      const transaction =
        await this.transactionRepository.findByReference(reference);
      if (!transaction) {
        return {
          success: false,
          error: 'Transaction not found',
          message: 'Transaction not found',
          statusCode: 404,
        };
      }

      // Fees used for original calculation (in cents)
      const calculatedBaseFeeCents = 500;
      // Determine calculated delivery fee based on how original amount was formed
      const originalSubtotalCents =
        transaction.amount -
        calculatedBaseFeeCents -
        (transaction.amount > 5000000 + calculatedBaseFeeCents ? 0 : 800);
      const calculatedDeliveryFeeCents =
        originalSubtotalCents > 5000000 ? 0 : 800;

      // Displayed fees in pesos (as per your original getTransactionById logic for display)
      const displayBaseFeePesos = 5000;
      const displayDeliveryFeePesos =
        transaction.amount > 5000000 + 500 ? 0 : 8000; // Match condition for 800 cents delivery fee

      return {
        success: true,
        data: {
          id: transaction.id,
          reference: transaction.reference,
          status: transaction.status,
          productName: transaction.productName,
          quantity: transaction.quantity,
          amount: this.convertCentsToPesos(transaction.amount),
          subtotal: this.convertCentsToPesos(
            transaction.amount -
              calculatedBaseFeeCents -
              calculatedDeliveryFeeCents,
          ),
          baseFee: displayBaseFeePesos,
          deliveryFee: displayDeliveryFeePesos,
          customerEmail: transaction.customerEmail,
        },
        message: 'Transaction retrieved successfully.',
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error fetching transaction',
        statusCode: 400,
      };
    }
  }

  async updateTransactionStatus(
    request: UpdateTransactionStatusRequest,
  ): Promise<{
    success: boolean;
    data?: {
      transactionId: string;
      status: string;
      wompiTransactionId?: string;
      stockUpdated: boolean;
    };
    error?: string;
    message: string;
    statusCode: number;
  }> {
    try {
      const existingTransaction = await this.transactionRepository.findById(
        request.transactionId,
      );
      if (!existingTransaction) {
        throw new NotFoundException(
          `Transaction with ID ${request.transactionId} not found.`,
        );
      }

      // Prevent redundant updates or illogical status changes if necessary
      if (
        existingTransaction.status === request.status &&
        existingTransaction.wompiTransactionId === request.wompiTransactionId
      ) {
        return {
          success: true,
          data: {
            transactionId: existingTransaction.id,
            status: existingTransaction.status,
            wompiTransactionId: existingTransaction.wompiTransactionId,
            stockUpdated: false,
          },
          message: 'Transaction status already matches. No update performed.',
          statusCode: 200, // Or 304 Not Modified
        };
      }

      const updatedTransaction =
        await this.transactionRepository.updateWompiTransactionStatus(
          request.transactionId,
          request.wompiTransactionId,
          request.status, // This should be a valid TransactionStatus enum value
        );

      let stockUpdated = false;
      // Update stock only if the transaction status changed to APPROVED
      if (
        updatedTransaction.isApproved() &&
        existingTransaction.status !== TransactionStatus.APPROVED
      ) {
        stockUpdated = await this.updateProductStock(updatedTransaction);
      }

      return {
        success: true,
        data: {
          transactionId: updatedTransaction.id,
          status: updatedTransaction.status,
          wompiTransactionId: updatedTransaction.wompiTransactionId,
          stockUpdated,
        },
        message: `Transaction status updated to ${updatedTransaction.status}.${stockUpdated ? ' Stock also updated.' : ''}`,
        statusCode: 200,
      };
    } catch (error) {
      console.error(
        `[UseCase] Error updating transaction status for ${request.transactionId}:`,
        error,
      );
      const statusCode =
        error instanceof NotFoundException
          ? 404
          : error instanceof BadRequestException
            ? 400
            : 500;
      return {
        success: false,
        error: error.message,
        message: 'Error updating transaction status',
        statusCode,
      };
    }
  }

  async updateTransactionStatusWebHook(request: UpdateWebHookRequest): Promise<{
    success: boolean;
    data?: {
      status: string;
      reference?: string;
    };
    error?: string;
    message: string;
    statusCode: number;
  }> {
    try {
      const existingTransaction =
        await this.transactionRepository.findByReference(request.reference);
      if (!existingTransaction) {
        throw new NotFoundException(
          `Transaction with ID ${request.reference} not found.`,
        );
      }

      // Prevent redundant updates or illogical status changes if necessary
      if (
        existingTransaction.status === request.status &&
        existingTransaction.reference === request.reference
      ) {
        return {
          success: true,
          data: {
            reference: request.reference,
            status: request.status,
          },
          message: 'Transaction status already matches. No update performed.',
          statusCode: 200, // Or 304 Not Modified
        };
      }

      const updatedTransaction =
        await this.transactionRepository.updateWompiTransactionReferencesStatus(
          request.reference,
          request.status, // This should be a valid TransactionStatus enum value
        );

      return {
        success: true,
        data: {
          reference: updatedTransaction.reference,
          status: updatedTransaction.status,
        },
        message: `Transaction status updated to ${updatedTransaction.status}`,
        statusCode: 200,
      };
    } catch (error) {
      console.error(
        `[UseCase] Error updating transaction status for ${request.reference}:`,
        error,
      );
      const statusCode =
        error instanceof NotFoundException
          ? 404
          : error instanceof BadRequestException
            ? 400
            : 500;
      return {
        success: false,
        error: error.message,
        message: 'Error updating transaction status',
        statusCode,
      };
    }
  }

  private async updateProductStock(transaction: Transaction): Promise<boolean> {
    try {
      await this.transactionRepository.recordStockMovement({
        productId: transaction.productId,
        transactionId: transaction.id,
        quantity: -transaction.quantity,
        movementType: 'SALE',
        reason: `Sale - Transaction ${transaction.reference}`,
      });

      await this.productRepository.updateStock(
        transaction.productId,
        -transaction.quantity,
      );
      return true;
    } catch (error) {
      console.error(
        '[TransactionUseCases] ❌ Error updating product stock:',
        error,
      );
      // Potentially, this could trigger a compensating action or retry
      return false;
    }
  }

  private parseExpiryDate(expiryDate: string): [string, string] {
    if (expiryDate.includes('/')) {
      const parts = expiryDate.split('/');
      if (
        parts.length === 2 &&
        parts[0].length === 2 &&
        parts[1].length === 2
      ) {
        return [parts[0].padStart(2, '0'), `20${parts[1]}`];
      }
    } else if (expiryDate.length === 4) {
      // MMYY format
      const month = expiryDate.substring(0, 2);
      const year = expiryDate.substring(2, 4);
      if (!isNaN(parseInt(month)) && !isNaN(parseInt(year))) {
        return [month.padStart(2, '0'), `20${year}`];
      }
    }
    throw new BadRequestException(
      'Invalid expiry date format. Expected MM/YY or MMYY.',
    );
  }

  private convertCentsToPesos(amountInCents: number): number {
    return Math.round(amountInCents / 100);
  }
}
