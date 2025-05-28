// src/context/transaction/domain/transaction.repository.ts
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

  // Soft delete para casos especiales
  abstract delete(id: string): Promise<void>;

  // ✅ WOMPI INTEGRATION según especificaciones del search result [1]

  // Step 4: "Final status" → Integración específica con Wompi API
  abstract updateWompiTransactionStatus(
    transactionId: string,
    wompiTransactionId: string,
    status: TransactionStatus,
  ): Promise<Transaction>;

  // Buscar transacciones pendientes para retry según search result [5]
  abstract findPendingWompiTransactions(
    olderThanMinutes?: number,
  ): Promise<Transaction[]>;

  // ✅ STOCK MANAGEMENT según Step 5 del search result [1]

  // Step 5: "Product page" → Registrar movimiento de stock
  abstract recordStockMovement(details: StockMovementDetails): Promise<void>;

  // Obtener transacciones que afectan stock de un producto
  abstract findTransactionsAffectingStock(
    productId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Transaction[]>;

  // ✅ DELIVERY MANAGEMENT según "Assign the product that will be delivered" del search result [1]

  // Step 5: Asignar productos para delivery
  abstract assignProductForDelivery(
    details: DeliveryAssignmentDetails,
  ): Promise<void>;

  // Encontrar transacciones listas para delivery
  abstract findTransactionsForDelivery(
    status: 'APPROVED',
  ): Promise<Transaction[]>;

  // Actualizar estado de delivery
  abstract updateDeliveryStatus(
    transactionId: string,
    deliveryStatus: string,
    trackingCode?: string,
  ): Promise<Transaction>;

  // ✅ QUERY OPERATIONS según especificaciones del test

  // Buscar con filtros y paginación
  abstract findAll(
    filters?: TransactionFilters,
    page?: number,
    limit?: number,
  ): Promise<TransactionListResponse>;

  // Buscar por estado específico
  abstract findByStatus(
    status: TransactionStatus,
    page?: number,
    limit?: number,
  ): Promise<Transaction[]>;

  // Buscar por email de cliente
  abstract findByCustomerEmail(
    email: string,
    page?: number,
    limit?: number,
  ): Promise<Transaction[]>;

  // ✅ ANALYTICS según especificaciones del test de la Tienda

  // Obtener métricas de transacciones
  abstract getTransactionSummary(
    startDate?: Date,
    endDate?: Date,
  ): Promise<TransactionSummary>;

  // ✅ SECURITY según especificaciones del test

  // Detectar transacciones sospechosas
  abstract findSuspiciousTransactions(): Promise<Transaction[]>;

  // Encontrar transacciones fallidas para retry
  abstract findFailedTransactionsForRetry(): Promise<Transaction[]>;

  // ✅ TESTING SUPPORT según search results [2-6]

  // Limpiar datos de prueba
  abstract clearTestData?(): Promise<void>;

  // Obtener estadísticas del repository
  abstract getRepositoryStats?(): Promise<{
    totalTransactions: number;
    byStatus: Record<string, number>;
    totalRevenue: number;
    memoryUsage?: string;
  }>;

  // ✅ WEBHOOK SUPPORT específico para Wompi según search result [1]

  // Validar webhook signature según documentación de la Tienda
  abstract validateWebhookSignature?(
    payload: string,
    signature: string,
    secret: string,
  ): boolean;

  // Procesar webhook de la Tienda
  abstract processWompiWebhook?(
    eventType: string,
    transactionData: any,
  ): Promise<Transaction>;

  // ✅ TRANSACTION FLOW HELPERS según flujo de 5 pasos del search result [1]

  // Crear transacción PENDING (Step 2)
  abstract createPendingTransaction?(
    productId: string,
    quantity: number,
    customerEmail: string,
    deliveryInfo?: any,
  ): Promise<Transaction>;

  // Procesar pago con Wompi (Step 4)
  abstract processPaymentWithWompi?(
    transactionId: string,
    paymentData: any,
  ): Promise<{
    success: boolean;
    wompiTransactionId?: string;
    status: TransactionStatus;
    error?: string;
  }>;

  // Completar flujo post-pago (Step 5)
  abstract completePostPaymentFlow?(transactionId: string): Promise<{
    stockUpdated: boolean;
    deliveryAssigned: boolean;
    emailSent: boolean;
  }>;

  // ✅ BUSINESS RULES según especificaciones del search result [1]

  // Calcular fees según especificaciones exactas de la Tienda
  abstract calculateTransactionFees?(subtotal: number): {
    baseFee: number; // 5000 pesos según test
    deliveryFee: number; // 8000 pesos o gratis > 50k según test
    total: number;
  };

  // Validar datos de tarjeta (fake pero estructura correcta)
  abstract validateCreditCardData?(
    cardNumber: string,
    cardHolder: string,
    expiryDate: string,
    cvv: string,
  ): {
    isValid: boolean;
    cardType: 'VISA' | 'MASTERCARD' | 'UNKNOWN';
    errors: string[];
  };

  // ✅ RESILIENCE según "Your app must be resilient" del search result [1]

  // Recuperar progreso del cliente en caso de refresh
  abstract recoverClientProgress?(
    sessionId: string,
    customerEmail: string,
  ): Promise<{
    step: 1 | 2 | 3 | 4 | 5;
    transactionId?: string;
    data?: any;
  }>;

  // Guardar progreso para resilience
  abstract saveClientProgress?(
    sessionId: string,
    step: number,
    data: any,
  ): Promise<void>;
}
