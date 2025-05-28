// DTO para crear transacción - Step 2 del flujo de 5 pasos según test de Tienda
export class CreateTransactionDto {
  productId: string;
  quantity: number;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  customerDocument?: string;
  customerDocumentType?: 'CC' | 'CE' | 'NIT' | 'PP';
  
  // Delivery information según flujo de 5 pasos del test
  deliveryInfo: DeliveryInfoDto;
}

// DTO para información de delivery según especificaciones del test
export class DeliveryInfoDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  department: string;
  postalCode?: string;
  country?: string = 'CO';
  specialInstructions?: string;
}

// DTO para procesar pago - Step 4 del flujo según test de Tienda
export class ProcessPaymentDto {
  transactionId: string;
  creditCardData: CreditCardDto;
  sessionId?: string; // Para anti-fraud según Tienda JS
}

// DTO para datos de tarjeta de crédito según especificaciones del test
export class CreditCardDto {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string; // MM/YY format según Tienda API
  cvv: string;
  cardType?: 'visa' | 'mastercard';
}

// DTO para actualizar estado de transacción según especificaciones del test
export class UpdateTransactionStatusDto {
  transactionId: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR' | 'CANCELLED' | 'REFUNDED';
  TiendaTransactionId?: string;
  paymentMethod?: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PSE' | 'NEQUI' | 'DAVIPLATA';
  statusMessage?: string;
}

// DTO para actualizar estado de delivery - Step 5 del flujo según test
export class DeliveryStatusUpdateDto {
  transactionId: string;
  deliveryStatus: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'SHIPPED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  trackingCode?: string;
  estimatedDeliveryDate?: string;
  deliveryNotes?: string;
}

// DTO para filtros de transacciones según especificaciones del test
export class TransactionFiltersDto {
  page?: number = 1;
  limit?: number = 10;
  sortBy?: string = 'createdAt';
  sortOrder?: 'asc' | 'desc' = 'desc';
  
  // Filtros según especificaciones del test de Tienda
  filters?: TransactionFiltersDataDto;
}

// DTO para datos de filtros según especificaciones del test
export class TransactionFiltersDataDto {
  status?: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR' | 'CANCELLED' | 'REFUNDED';
  customerEmail?: string;
  customerName?: string;
  dateFrom?: string; // ISO string
  dateTo?: string; // ISO string
  TiendaTransactionId?: string;
  reference?: string;
  amountFrom?: number; // En centavos según Tienda
  amountTo?: number; // En centavos según Tienda
  paymentMethod?: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PSE' | 'NEQUI' | 'DAVIPLATA';
  hasDelivery?: boolean;
  deliveryStatus?: string;
  productId?: string;
  categoryId?: string;
}

// DTO para respuesta de transacción según especificaciones del test
export class TransactionResponseDto {
  id: string;
  reference: string;
  status: string;
  amount: number; // En pesos para frontend (convertido desde centavos)
  subtotal: number;
  baseFee: number; // 5000 pesos según documento PDF del test
  deliveryFee: number; // 8000 pesos o gratis según test
  customerEmail: string;
  customerName?: string;
  TiendaTransactionId?: string;
  paymentMethod?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  
  // Información de delivery optimizada para cliente
  deliveryInfo?: DeliveryResponseDto;
  
  // Items simplificados para response
  items: TransactionItemResponseDto[];
}

// DTO para respuesta de delivery según especificaciones del test
export class DeliveryResponseDto {
  fullName: string;
  email: string;
  phone: string;
  fullAddress: string;
  city: string;
  department: string;
  country: string;
  specialInstructions?: string;
}

// DTO para item de transacción en response según especificaciones del test
export class TransactionItemResponseDto {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number; // En pesos para frontend
  totalPrice: number; // En pesos para frontend
  
  // Product snapshot para delivery según especificaciones del test
  productSnapshot: ProductSnapshotDto;
}

// DTO para snapshot de producto según especificaciones del test
export class ProductSnapshotDto {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  sku: string;
  stockAtPurchase: number;
}

// DTO para respuesta de lista de transacciones según especificaciones del test
export class TransactionListResponseDto {
  data: TransactionResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  message: string;
  statusCode: number;
}

// DTO para resumen de transacciones según especificaciones del test
export class TransactionSummaryDto {
  totalTransactions: number;
  pendingTransactions: number;
  approvedTransactions: number;
  declinedTransactions: number;
  errorTransactions: number;
  cancelledTransactions: number;
  
  // Revenue en pesos (convertido desde centavos) para frontend
  totalRevenue: number;
  totalBaseFees: number; // Suma de todos los base fees según test
  totalDeliveryFees: number; // Suma de todos los delivery fees según test
  averageTransactionAmount: number;
  
  // Métricas de tiempo según especificaciones del test
  todayTransactions: number;
  yesterdayTransactions: number;
  
  // Período de análisis
  periodStart?: string;
  periodEnd?: string;
}

// DTO para respuesta de Tienda según especificaciones del test
export class TiendaTransactionResponseDto {
  success: boolean;
  data?: {
    transactionId: string;
    reference: string;
    status: string;
    TiendaTransactionId: string;
    amount: number; // En pesos para frontend
    deliveryAssigned: boolean; // Step 5 del flujo según test
    stockUpdated: boolean; // Step 5 del flujo según test
    updatedAt: string;
  };
  error?: string;
  message: string;
  statusCode: number;
}

// DTO para respuesta de crear transacción según especificaciones del test
export class CreateTransactionResponseDto {
  success: boolean;
  data?: {
    transactionId: string;
    reference: string;
    status: string;
    amount: number; // En pesos para frontend
    estimatedDeliveryDate: string; // ISO string según test
    trackingCode: string; // Generado según especificaciones
    createdAt: string;
  };
  error?: string;
  message: string;
  statusCode: number;
}

// DTO primitivo para transacción según especificaciones del test
export class PrimitiveTransactionDto {
  id: string;
  reference: string;
  userId?: string;
  status: string;
  
  // Montos en pesos (convertidos desde centavos) para frontend
  amount: number;
  subtotal: number;
  baseFee: number; // 5000 pesos según documento PDF
  deliveryFee: number; // 8000 pesos o gratis según test
  
  // Información de pago según especificaciones del test
  TiendaTransactionId?: string;
  paymentMethod?: string;
  
  // Datos del cliente optimizados según especificaciones del test
  customerName?: string;
  customerEmail: string;
  customerPhone?: string;
  customerDocument?: string;
  customerDocumentType?: string;
  
  // Delivery info simplificada según especificaciones del test
  deliveryInfo?: {
    fullName: string;
    fullAddress: string;
    phone: string;
    email: string;
    specialInstructions?: string;
  };
  
  // Items simplificados según especificaciones del test
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number; // En pesos para frontend
    totalPrice: number; // En pesos para frontend
  }>;
  
  // Timestamps como strings ISO según especificaciones del test
  createdAt: string;
  updatedAt: string;
  
  // Campos calculados para frontend según especificaciones del test
  totalItemsQuantity: number;
  canBeProcessed: boolean;
  isPending: boolean;
  isApproved: boolean;
}

// DTO para webhook de Tienda según especificaciones del test
export class TiendaWebhookDto {
  event: string; // 'transaction.updated' según Tienda docs
  data: {
    id: string;
    status: string;
    reference: string;
    amount_in_cents: number; // Tienda API usa centavos
    currency: string;
    customer_email: string;
    payment_method_type: string;
    created_at: string;
    finalized_at?: string;
  };
  environment: 'test' | 'production';
  signature: {
    properties: string[];
    checksum: string;
  };
  timestamp: number;
}

// DTO para respuesta de proceso completo según flujo de 5 pasos del test
export class CompletePaymentProcessDto {
  success: boolean;
  data?: {
    // Step 1: Product info
    productInfo: {
      id: string;
      name: string;
      finalStock: number;
    };
    
    // Step 2-4: Transaction info
    transactionInfo: {
      id: string;
      reference: string;
      status: string;
      amount: number;
      TiendaTransactionId: string;
    };
    
    // Step 5: Delivery info
    deliveryInfo: {
      assigned: boolean;
      trackingCode: string;
      estimatedDate: string;
    };
    
    // Step 5: Stock info
    stockInfo: {
      updated: boolean;
      previousStock: number;
      newStock: number;
      quantitySold: number;
    };
  };
  error?: string;
  message: string;
  statusCode: number;
}

// DTO para datos de stock según especificaciones del test
export class StockMovementDto {
  productId: string;
  transactionId: string;
  quantity: number;
  movementType: 'SALE' | 'RETURN' | 'ADJUSTMENT';
  previousStock: number;
  newStock: number;
  reason: string;
  createdAt: string;
}

// DTO para métricas de Tienda según especificaciones del test
export class TiendaMetricsDto {
  totalTiendaTransactions: number;
  successfulTiendaTransactions: number;
  failedTiendaTransactions: number;
  averageProcessingTime: number; // En milisegundos
  TiendaErrorRate: number; // Porcentaje
  periodStart: string;
  periodEnd: string;
}

// DTO para análisis de conversión según flujo de 5 pasos del test
export class ConversionFunnelDto {
  step1_ProductViews: number; // Vistas del producto
  step2_PaymentInitiated: number; // Credit Card/Delivery info completado
  step3_SummaryViewed: number; // Summary mostrado
  step4_PaymentProcessed: number; // Final status (pagos procesados)
  step5_ProductUpdated: number; // Product page con stock actualizado
  conversionRate: number; // Porcentaje de conversión total
  dropOffRates: {
    step1to2: number;
    step2to3: number;
    step3to4: number;
    step4to5: number;
  };
}

// DTO para respuesta de error según especificaciones del test
export class ErrorResponseDto {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  details?: Record<string, any>;
}

// DTO para respuesta exitosa genérica según especificaciones del test
export class SuccessResponseDto<T = any> {
  success: true;
  data: T;
  message: string;
  statusCode: number;
  timestamp: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}
