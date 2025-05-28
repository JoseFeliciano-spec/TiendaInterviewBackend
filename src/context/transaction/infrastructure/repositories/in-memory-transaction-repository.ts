// src/context/transaction/infrastructure/PrismaTransactionRepository.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/context/shared/database/prisma.service';
import {
  Transaction,
  TransactionStatus,
} from '../../domain/transaction.entity';
import {
  TransactionRepository,
  StockMovementDetails,
  DeliveryAssignmentDetails,
  TransactionFilters,
  TransactionListResponse,
  TransactionSummary,
} from '../../domain/transaction.repository';
import { WompiService } from '@/context/shared/wompi/wompi.service';

@Injectable()
export class InMemoryTransactionRepository implements TransactionRepository {
  private readonly logger = new Logger();

  constructor(
    private readonly prisma: PrismaService,
    private readonly wompiService: WompiService,
  ) {}
  delete(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  findPendingWompiTransactions(
    olderThanMinutes?: number,
  ): Promise<Transaction[]> {
    throw new Error('Method not implemented.');
  }
  findTransactionsAffectingStock(
    productId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Transaction[]> {
    throw new Error('Method not implemented.');
  }
  assignProductForDelivery(details: DeliveryAssignmentDetails): Promise<void> {
    throw new Error('Method not implemented.');
  }
  findTransactionsForDelivery(status: 'APPROVED'): Promise<Transaction[]> {
    throw new Error('Method not implemented.');
  }
  updateDeliveryStatus(
    transactionId: string,
    deliveryStatus: string,
    trackingCode?: string,
  ): Promise<Transaction> {
    throw new Error('Method not implemented.');
  }
  findAll(
    filters?: TransactionFilters,
    page?: number,
    limit?: number,
  ): Promise<TransactionListResponse> {
    throw new Error('Method not implemented.');
  }
  findByStatus(
    status: TransactionStatus,
    page?: number,
    limit?: number,
  ): Promise<Transaction[]> {
    throw new Error('Method not implemented.');
  }
  findByCustomerEmail(
    email: string,
    page?: number,
    limit?: number,
  ): Promise<Transaction[]> {
    throw new Error('Method not implemented.');
  }
  getTransactionSummary(
    startDate?: Date,
    endDate?: Date,
  ): Promise<TransactionSummary> {
    throw new Error('Method not implemented.');
  }
  findSuspiciousTransactions(): Promise<Transaction[]> {
    throw new Error('Method not implemented.');
  }
  findFailedTransactionsForRetry(): Promise<Transaction[]> {
    throw new Error('Method not implemented.');
  }
  clearTestData?(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getRepositoryStats?(): Promise<{
    totalTransactions: number;
    byStatus: Record<string, number>;
    totalRevenue: number;
    memoryUsage?: string;
  }> {
    throw new Error('Method not implemented.');
  }
  validateWebhookSignature?(
    payload: string,
    signature: string,
    secret: string,
  ): boolean {
    throw new Error('Method not implemented.');
  }
  processWompiWebhook?(
    eventType: string,
    transactionData: any,
  ): Promise<Transaction> {
    throw new Error('Method not implemented.');
  }
  createPendingTransaction?(
    productId: string,
    quantity: number,
    customerEmail: string,
    deliveryInfo?: any,
  ): Promise<Transaction> {
    throw new Error('Method not implemented.');
  }
  processPaymentWithWompi?(
    transactionId: string,
    paymentData: any,
  ): Promise<{
    success: boolean;
    wompiTransactionId?: string;
    status: TransactionStatus;
    error?: string;
  }> {
    throw new Error('Method not implemented.');
  }
  completePostPaymentFlow?(transactionId: string): Promise<{
    stockUpdated: boolean;
    deliveryAssigned: boolean;
    emailSent: boolean;
  }> {
    throw new Error('Method not implemented.');
  }
  calculateTransactionFees?(subtotal: number): {
    baseFee: number;
    deliveryFee: number;
    total: number;
  } {
    throw new Error('Method not implemented.');
  }
  validateCreditCardData?(
    cardNumber: string,
    cardHolder: string,
    expiryDate: string,
    cvv: string,
  ): {
    isValid: boolean;
    cardType: 'VISA' | 'MASTERCARD' | 'UNKNOWN';
    errors: string[];
  } {
    throw new Error('Method not implemented.');
  }
  recoverClientProgress?(
    sessionId: string,
    customerEmail: string,
  ): Promise<{ step: 1 | 2 | 3 | 4 | 5; transactionId?: string; data?: any }> {
    throw new Error('Method not implemented.');
  }
  saveClientProgress?(
    sessionId: string,
    step: number,
    data: any,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  // src/context/transaction/infrastructure/PrismaTransactionRepository.ts
  // src/context/transaction/infrastructure/PrismaTransactionRepository.ts
  async save(
    transaction: Transaction,
    paymentData?: {
      cardNumber: string;
      cardHolder: string;
      expiryDate: string;
      cvv: string;
    },
  ): Promise<Transaction> {
    try {
      const primitiveData = transaction.toPrimitives();

      this.logger.log(
        `💾 Saving transaction with Wompi: ${primitiveData.reference}`,
      );

      const result = await this.prisma.$transaction(async (tx) => {
        // 1. ✅ Verificar stock según Step 2 del search result [1]
        const product = await tx.product.findUnique({
          where: { id: primitiveData.productId },
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            isActive: true,
          },
        });

        if (!product) {
          throw new BadRequestException(
            `Product ${primitiveData.productId} not found`,
          );
        }

        if (!product.isActive) {
          throw new BadRequestException(
            `Product ${product.name} is not active`,
          );
        }

        if (product.stock < primitiveData.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${product.name}`,
          );
        }

        // 2. ✅ Calcular montos según especificaciones del test
        const productSubtotal = Number(product.price) * primitiveData.quantity;
        const baseFee = 500; // En centavos
        const deliveryFee = productSubtotal > 5000000 ? 0 : 800;
        const totalAmount = productSubtotal + baseFee + deliveryFee;

        // 3. ✅ Crear transacción con nested write correcto según search results [5], [7]
        const saved = await tx.transaction.create({
          data: {
            id: primitiveData.id,
            reference: primitiveData.reference,
            status: 'PENDING',
            amount: Number(totalAmount),
            subtotal: Number(productSubtotal),
            baseFee: Number(baseFee),
            deliveryFee: Number(deliveryFee),
            customerEmail: primitiveData.customerEmail,
            wompiTransactionId: null,
            createdAt: primitiveData.createdAt,
            updatedAt: new Date(),

            // ✅ SINTAXIS CORRECTA según search result [7] - Nested write
            transactionItems: {
              create: [
                // ✅ Usar 'create' para nested writes
                {
                  // ✅ NO incluir 'id' ni 'transactionId' - Prisma los maneja automáticamente
                  productId: primitiveData.productId,
                  quantity: primitiveData.quantity,
                  unitPrice: Number(Number(product.price)), // Precio unitario al momento de la compra
                  totalPrice: Number(productSubtotal), // Precio total del item
                },
              ],
            },
          },
          include: {
            transactionItems: true, // ✅ Incluir items en la respuesta
          },
        });

        this.logger.log(`✅ Transaction with items saved: ${saved.reference}`);
        return saved;
      });

      // 4. ✅ Procesar con Wompi si hay payment data
      if (paymentData) {
        return await this.processWithWompiTokenization(result, paymentData);
      }

      return this.mapToTransaction(result);
    } catch (error) {
      this.logger.error(`❌ Error in save: ${error.message}`);
      throw new BadRequestException(
        `Error saving transaction: ${error.message}`,
      );
    }
  }

  private async processWithWompiTokenization(
    transactionData: any,
    paymentData: {
      cardNumber: string;
      cardHolder: string;
      expiryDate: string;
      cvv: string;
    },
  ): Promise<Transaction> {
    try {
      this.logger.log(
        `🚀 Processing payment with Wompi tokenization: ${transactionData.reference}`,
      );

      // 4.1 ✅ PASO 1: Tokenizar tarjeta según documentación oficial de la Tienda
      const [expiryMonth, expiryYear] = this.parseExpiryDate(
        paymentData.expiryDate,
      );

      this.logger.log(`🔒 Step 1: Tokenizing card with Wompi API`);

      const tokenResult = await this.wompiService.tokenizeCard({
        cardNumber: paymentData.cardNumber,
        cardHolder: paymentData.cardHolder,
        expiryMonth,
        expiryYear,
        cvv: paymentData.cvv,
      });

      if (!tokenResult.success || !tokenResult.data) {
        this.logger.error(`❌ Wompi tokenization failed: ${tokenResult.error}`);
        await this.updateTransactionStatus(transactionData.id, 'ERROR', null);
        throw new BadRequestException(
          `Wompi tokenization failed: ${tokenResult.error || 'Unknown error'}`,
        );
      }

      this.logger.log(
        `✅ Card tokenized successfully: ${tokenResult.data.id} - Brand: ${tokenResult.data.brand} - Last four: ${tokenResult.data.last_four}`,
      );

      // 4.2 ✅ PASO 2: Crear transacción en Wompi usando el token según search result [2]
      this.logger.log(`💳 Step 2: Creating Wompi transaction with token`);

      const wompiTransactionResult = await this.wompiService.createTransaction({
        amount: Number(transactionData.amount),
        currency: 'COP',
        customerEmail: transactionData.customerEmail,
        reference: transactionData.reference,
        //Token
        paymentSourceId: tokenResult.data.id,
      });

      if (!wompiTransactionResult.success || !wompiTransactionResult.data) {
        this.logger.error(
          `❌ Wompi transaction creation failed: ${wompiTransactionResult.error}`,
        );
        await this.updateTransactionStatus(transactionData.id, 'ERROR', null);
        throw new BadRequestException(
          `Wompi transaction failed: ${wompiTransactionResult.error || 'Unknown error'}`,
        );
      }

      const wompiResult = wompiTransactionResult.data;
      this.logger.log(
        `✅ Wompi transaction created: ${wompiResult.id} - Status: ${wompiResult.status}`,
      );

      // 4.3 ✅ PASO 3: Mapear estado de la Tienda y actualizar transacción local según search result [1]
      const finalStatus = this.mapWompiStatus(wompiResult.status);

      const updatedTransaction = await this.updateWompiTransactionStatus(
        transactionData.id,
        wompiResult.id,
        finalStatus,
      );

      return updatedTransaction;
    } catch (error) {
      this.logger.error(
        `❌ Error in Wompi tokenization process: ${error.message}`,
      );

      try {
        await this.updateTransactionStatus(transactionData.id, 'ERROR', null);
      } catch (updateError) {
        this.logger.error(
          `❌ Error updating transaction to ERROR status: ${updateError.message}`,
        );
      }

      throw error;
    }
  }

  // ✅ Método helper para actualizar estado de transacción
  private async updateTransactionStatus(
    transactionId: string,
    status: any,
    wompiTransactionId: string | null,
  ): Promise<void> {
    try {
      await this.prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status,
          wompiTransactionId,
          updatedAt: new Date(),
        },
      });

      this.logger.log(
        `✅ Transaction status updated: ${transactionId} -> ${status}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Error updating transaction status: ${error.message}`,
      );
    }
  }

  // ✅ Método para auto-actualizar stock según Step 5 del search result [1]
  private async autoUpdateStock(transaction: Transaction): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        // 1. Obtener producto actual
        const product = await tx.product.findUnique({
          where: { id: transaction.productId },
          select: { stock: true, name: true },
        });

        if (!product) {
          this.logger.error(
            `❌ Product not found for stock update: ${transaction.productId}`,
          );
          return;
        }

        const newStock = product.stock - transaction.quantity;

        if (newStock < 0) {
          this.logger.error(
            `❌ Insufficient stock for approved transaction. Available: ${product.stock}, Required: ${transaction.quantity}`,
          );
          return; // No lanzar error para evitar rollback de transacción aprobada
        }

        // 2. Actualizar stock del producto
        await tx.product.update({
          where: { id: transaction.productId },
          data: {
            stock: newStock,
            updatedAt: new Date(),
          },
        });

        // 3. Registrar movimiento de stock
        await tx.stockMovement.create({
          data: {
            productId: transaction.productId,
            quantity: -transaction.quantity, // Negativo = venta
            movementType: 'SALE',
            reason: `Auto Sale - Transaction ${transaction.reference} APPROVED by Wompi`,
            previousStock: product.stock,
            newStock: newStock,
            reference: transaction.reference,
            createdAt: new Date(),
          },
        });

        this.logger.log(
          `📦 Auto stock updated: ${product.name} - ${product.stock} -> ${newStock} (-${transaction.quantity})`,
        );
      });
    } catch (error) {
      this.logger.error(`❌ Error in auto stock update: ${error.message}`);
    }
  }

  // ✅ Helper methods según search results [4-6]
  private parseExpiryDate(expiryDate: string): [string, string] {
    if (expiryDate.includes('/')) {
      const parts = expiryDate.split('/');
      if (
        parts.length === 2 &&
        parts[0].length === 2 &&
        parts[1].length === 2
      ) {
        return [parts[0].padStart(2, '0'), parts[1]]; // retorna año con 2 dígitos
      }
    } else if (expiryDate.length === 4) {
      // MMYY format
      const month = expiryDate.substring(0, 2);
      const year = expiryDate.substring(2, 4);
      if (!isNaN(parseInt(month)) && !isNaN(parseInt(year))) {
        return [month.padStart(2, '0'), year]; // retorna año con 2 dígitos
      }
    }
    throw new BadRequestException(
      'Invalid expiry date format. Expected MM/YY or MMYY.',
    );
  }

  private mapWompiStatus(wompiStatus: string): TransactionStatus {
    // ✅ Mapeo según estados de la Tienda del search result [4]
    const statusMapping: Record<string, TransactionStatus> = {
      APPROVED: TransactionStatus.APPROVED,
      DECLINED: TransactionStatus.DECLINED,
      PENDING: TransactionStatus.PENDING,
      ERROR: TransactionStatus.ERROR,
      FAILED: TransactionStatus.DECLINED,
      VOIDED: TransactionStatus.DECLINED,
    };

    const mappedStatus = statusMapping[wompiStatus.toUpperCase()];

    if (!mappedStatus) {
      this.logger.error(
        `❌ Unknown Wompi status: ${wompiStatus} - Defaulting to ERROR`,
      );
      return TransactionStatus.ERROR;
    }

    return mappedStatus;
  }

  async findById(id: string): Promise<Transaction | null> {
    try {
      const result = await this.prisma.transaction.findUnique({
        where: { id },
      });

      if (!result) return null;

      return this.mapToTransaction(result);
    } catch (error) {
      this.logger.error(`❌ Error finding transaction: ${error.message}`);
      throw new BadRequestException(
        `Error finding transaction: ${error.message}`,
      );
    }
  }

  async findByReference(reference: string): Promise<Transaction | null> {
    try {
      const result = await this.prisma.transaction.findFirst({
        where: { reference },
      });

      if (!result) return null;

      return this.mapToTransaction(result);
    } catch (error) {
      this.logger.error(
        `❌ Error finding transaction by reference: ${error.message}`,
      );
      throw new BadRequestException(
        `Error finding transaction by reference: ${error.message}`,
      );
    }
  }

  async update(transaction: Transaction): Promise<Transaction> {
    try {
      const primitiveData = transaction.toPrimitives();

      const result = await this.prisma.transaction.update({
        where: { id: primitiveData.id },
        data: {
          status: primitiveData.status,
          updatedAt: new Date(),
        },
      });

      return this.mapToTransaction(result);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `Transaction with ID ${transaction.id} not found`,
        );
      }
      throw new BadRequestException(
        `Error updating transaction: ${error.message}`,
      );
    }
  }

  // ✅ Método clave para webhook de la Tienda según search result [3]
  async updateWompiTransactionStatus(
    transactionId: string,
    wompiTransactionId: string,
    status: TransactionStatus,
  ): Promise<Transaction> {
    try {
      // ✅ Transacción atómica: Update status + Auto stock update según search results [5-8]
      const result = await this.prisma.$transaction(async (tx) => {
        // Actualizar transacción
        const updatedTransaction = await tx.transaction.update({
          where: { id: transactionId },
          data: {
            status,
            wompiTransactionId,
            updatedAt: new Date(),
          },
        });

        // ✅ AUTO STOCK UPDATE - Step 5 del flujo según search result [1]
        if (status === TransactionStatus.APPROVED) {
          this.logger.log(
            `✅ Transaction APPROVED - Executing Step 5: Auto stock update`,
          );

          const product = await tx.product.findUnique({
            where: { id: updatedTransaction.id },
            select: { stock: true, name: true },
          });

          if (product) {
            const newStock = product.stock - updatedTransaction.amount;

            if (newStock >= 0) {
              // Actualizar stock
              await tx.product.update({
                where: { id: updatedTransaction.id },
                data: {
                  stock: newStock,
                  updatedAt: new Date(),
                },
              });

              await tx.stockMovement.create({
                data: {
                  productId: updatedTransaction.deliveryId,
                  quantity: -updatedTransaction.baseFee,
                  movementType: 'SALE',
                  reason: `Sale - Transaction ${updatedTransaction.reference} APPROVED`,
                  previousStock: product.stock,
                  newStock: newStock,
                  reference: updatedTransaction.reference,
                },
              });

              this.logger.log(
                `📦 Stock updated automatically: ${product.name} - ${product.stock} -> ${newStock}`,
              );
            }
          }
        }

        return updatedTransaction;
      });

      this.logger.log(
        `✅ Wompi transaction updated: ${result.reference} - Status: ${status}`,
      );
      return this.mapToTransaction(result);
    } catch (error) {
      this.logger.error(
        `❌ Error updating Wompi transaction: ${error.message}`,
      );
      throw new BadRequestException(
        `Error updating Wompi transaction: ${error.message}`,
      );
    }
  }

  async recordStockMovement(details: StockMovementDetails): Promise<void> {
    try {
      await this.prisma.stockMovement.create({
        data: {
          productId: details.productId,
          quantity: details.quantity,
          movementType: 'ADJUSTMENT',
          newStock: 20,
          previousStock: 30,
          reason: details.reason,
          reference: `MANUAL_${details.transactionId}_${Date.now()}`,
        },
      });

      this.logger.log(
        `✅ Stock movement recorded: ${details.movementType} - ${details.quantity} units`,
      );
    } catch (error) {
      this.logger.error(`❌ Error recording stock movement: ${error.message}`);
      throw new BadRequestException(
        `Error recording stock movement: ${error.message}`,
      );
    }
  }

  private mapToTransaction(data: any): Transaction {
    return new Transaction(
      data.id,
      data.reference,
      data.status,
      data.productId,
      data.productName,
      data.quantity,
      Number(data.amount), // Convert Number to number
      data.customerEmail,
      data.wompiTransactionId,
      data.createdAt,
      data.updatedAt,
    );
  }
}
