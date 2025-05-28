import { Transaction, TransactionStatus } from './transaction.entity';

// ✅ Interfaces según especificaciones exactas del search result [1]
export interface StockMovementDetails {
  productId: string;
  transactionId: string;
  quantity: number;
  movementType: 'SALE' | 'RESTOCK' | 'ADJUSTMENT' | 'RETURN' | 'DAMAGE';
  reason: string;
  previousStock?: number;
  newStock?: number;
  reference?: string;
}

export interface DeliveryAssignmentDetails {
  transactionId: string;
  productId: string;
  productName: string;
  quantity: number;
  customerEmail: string;
  estimatedDeliveryDate?: Date;
  trackingCode?: string;
}

export interface TransactionFilters {
  status?: TransactionStatus;
  customerEmail?: string;
  dateFrom?: Date;
  dateTo?: Date;
  wompiTransactionId?: string;
  reference?: string;
  productId?: string;
  amountFrom?: number;
  amountTo?: number;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface TransactionSummary {
  totalTransactions: number;
  pendingTransactions: number;
  approvedTransactions: number;
  declinedTransactions: number;
  totalRevenue: number; // En centavos según Wompi
  todayTransactions: number;
  avgTransactionAmount: number;
}

// ✅ Port según Hexagonal Architecture del search result [1]
export abstract class TransactionRepository {
  // ✅ CORE CRUD operations según flujo de 5 pasos del test de la Tienda

  // Step 2: "Credit Card/Delivery info" → Crear transacción PENDING
  abstract save(
    transaction: Transaction,
    paymentData?: {
      cardNumber: string;
      cardHolder: string;
      expiryDate: string;
      cvv: string;
    },
  ): Promise<Transaction>;

  // Step 3: "Summary" → Obtener transacción para mostrar resumen
  abstract findById(id: string): Promise<Transaction | null>;

  // Step 4: "Final status" → Webhook de la Tienda busca por reference
  abstract findByReference(reference: string): Promise<Transaction | null>;

  // Actualización general de transacciones
  abstract update(transaction: Transaction): Promise<Transaction>;

  // ✅ WOMPI INTEGRATION según especificaciones del search result [1]

  // Step 4: "Final status" → Integración específica con Wompi API
  abstract updateWompiTransactionStatus(
    transactionId: string,
    wompiTransactionId: string,
    status: TransactionStatus,
  ): Promise<Transaction>;


  abstract updateWompiTransactionReferencesStatus(
    references: string,
    status: TransactionStatus,
  ): Promise<Transaction>;

  // ✅ STOCK MANAGEMENT según Step 5 del search result [1]

  // Step 5: "Product page" → Registrar movimiento de stock
  abstract recordStockMovement(details: StockMovementDetails): Promise<void>;
}
