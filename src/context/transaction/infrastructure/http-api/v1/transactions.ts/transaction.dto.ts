import { 
  IsString, 
  IsNumber, 
  IsEmail, 
  IsOptional, 
  ValidateNested, 
  IsEnum, 
  IsDateString,
  IsBoolean,
  Min,
  Max,
  Length,
  Matches,
  IsInt
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DeliveryInfoDto {
  @ApiProperty({ 
    description: 'Delivery recipient first name',
    example: 'Juan'
  })
  @IsString()
  @Length(2, 50)
  firstName: string;

  @ApiProperty({ 
    description: 'Delivery recipient last name',
    example: 'Pérez'
  })
  @IsString()
  @Length(2, 50)
  lastName: string;

  @ApiProperty({ 
    description: 'Delivery recipient email',
    example: 'juan.perez@example.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    description: 'Delivery recipient phone',
    example: '+57 300 123 4567'
  })
  @IsString()
  @Matches(/^[\+]?[0-9\s\-\(\)]{7,15}$/, { message: 'Invalid phone number format' })
  phone: string;

  @ApiProperty({ 
    description: 'Delivery address',
    example: 'Calle 123 #45-67, Apto 890'
  })
  @IsString()
  @Length(10, 200)
  address: string;

  @ApiProperty({ 
    description: 'Delivery city',
    example: 'Bogotá'
  })
  @IsString()
  @Length(2, 50)
  city: string;

  @ApiProperty({ 
    description: 'Delivery department/state',
    example: 'Cundinamarca'
  })
  @IsString()
  @Length(2, 50)
  department: string;

  @ApiPropertyOptional({ 
    description: 'Postal code',
    example: '110111'
  })
  @IsOptional()
  @IsString()
  @Length(5, 10)
  postalCode?: string;

  @ApiPropertyOptional({ 
    description: 'Country code',
    example: 'CO',
    default: 'CO'
  })
  @IsOptional()
  @IsString()
  @Length(2, 3)
  country?: string;

  @ApiPropertyOptional({ 
    description: 'Special delivery instructions',
    example: 'Ring the doorbell twice. Apartment 890.'
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  specialInstructions?: string;
}

// ✅ DTO para crear transacción - Step 2 del flujo de 5 pasos según test de Tienda
export class CreateTransactionDto {
  @ApiProperty({ 
    description: 'Product ID to purchase',
    example: 'prod-12345'
  })
  @IsString()
  productId: string;

  @ApiProperty({ 
    description: 'Quantity of products to purchase',
    example: 2,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ 
    description: 'Customer email address',
    example: 'customer@example.com'
  })
  @IsEmail()
  customerEmail: string;

  @ApiPropertyOptional({ 
    description: 'Customer full name',
    example: 'Juan Pérez'
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  customerName?: string;

  @ApiPropertyOptional({ 
    description: 'Customer phone number',
    example: '+57 300 123 4567'
  })
  @IsOptional()
  @IsString()
  @Matches(/^[\+]?[0-9\s\-\(\)]{7,15}$/, { message: 'Invalid phone number format' })
  customerPhone?: string;

  @ApiPropertyOptional({ 
    description: 'Customer document number',
    example: '12345678'
  })
  @IsOptional()
  @IsString()
  customerDocument?: string;

  @ApiPropertyOptional({ 
    description: 'Customer document type',
    enum: ['CC', 'CE', 'NIT', 'PP'],
    example: 'CC'
  })
  @IsOptional()
  @IsEnum(['CC', 'CE', 'NIT', 'PP'])
  customerDocumentType?: 'CC' | 'CE' | 'NIT' | 'PP';

  @ApiProperty({ 
    description: 'Delivery information according to Tienda 5-step process',
    type: () => DeliveryInfoDto
  })
  @ValidateNested()
  @Type(() => DeliveryInfoDto)
  deliveryInfo: DeliveryInfoDto;

  @ApiProperty({ 
    description: 'Card holder full name',
    example: 'Juan Pérez'
  })
  @IsString()
  @Length(2, 100)
  cardHolder: string;

  @ApiProperty({ 
    description: 'Card number (PAN)',
    example: '4111111111111111'
  })
  @IsString()
  @Matches(/^\d{13,19}$/, { message: 'Card number must be between 13 and 19 digits' })
  cardNumber: string;

  @ApiProperty({ 
    description: 'Card CVV code',
    example: '123'
  })
  @IsString()
  @Matches(/^\d{3,4}$/, { message: 'CVV must be 3 or 4 digits' })
  cvv: string;

  @ApiProperty({ 
    description: 'Card expiry date in MM/YY format',
    example: '12/26'
  })
  @IsString()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'Expiry date must be in MM/YY format' })
  expiryDate: string;
}


// ✅ DTO para procesar pago - Step 4 del flujo según test de Tienda
export class ProcessPaymentDto {
  @ApiProperty({ 
    description: 'Credit card number (fake but valid format for testing)',
    example: '4242424242424242'
  })
  @IsString()
  @Matches(/^[0-9]{13,19}$/, { message: 'Invalid credit card number format' })
  cardNumber: string;

  @ApiProperty({ 
    description: 'Card holder full name as appears on card',
    example: 'JUAN PEREZ'
  })
  @IsString()
  @Length(2, 100)
  @Matches(/^[A-Za-z\s]+$/, { message: 'Card holder name must contain only letters and spaces' })
  cardHolder: string;

  @ApiProperty({ 
    description: 'Card expiry date in MM/YY format',
    example: '12/25'
  })
  @IsString()
  @Matches(/^(0[1-9]|1[0-2])\/[0-9]{2}$/, { message: 'Expiry date must be in MM/YY format' })
  expiryDate: string;

  @ApiProperty({ 
    description: 'Card CVV security code',
    example: '123'
  })
  @IsString()
  @Matches(/^[0-9]{3,4}$/, { message: 'CVV must be 3 or 4 digits' })
  cvv: string;

  @ApiPropertyOptional({ 
    description: 'Session ID for anti-fraud according to Tienda JS',
    example: 'session_12345'
  })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

// ✅ DTO para actualizar estado de transacción según especificaciones del test
export class UpdateTransactionStatusDto {
  @ApiProperty({ 
    description: 'New transaction status',
    enum: ['PENDING', 'APPROVED', 'DECLINED', 'ERROR', 'CANCELLED', 'REFUNDED'],
    example: 'APPROVED'
  })
  @IsEnum(['PENDING', 'APPROVED', 'DECLINED', 'ERROR', 'CANCELLED', 'REFUNDED'])
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR' | 'CANCELLED' | 'REFUNDED';

  @ApiPropertyOptional({ 
    description: 'Tienda transaction ID from payment processing',
    example: '01-1532941443-49201'
  })
  @IsOptional()
  @IsString()
  TiendaTransactionId?: string;

  @ApiPropertyOptional({ 
    description: 'Payment method used',
    enum: ['CREDIT_CARD', 'DEBIT_CARD', 'PSE', 'NEQUI', 'DAVIPLATA'],
    example: 'CREDIT_CARD'
  })
  @IsOptional()
  @IsEnum(['CREDIT_CARD', 'DEBIT_CARD', 'PSE', 'NEQUI', 'DAVIPLATA'])
  paymentMethod?: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PSE' | 'NEQUI' | 'DAVIPLATA';

  @ApiPropertyOptional({ 
    description: 'Status update message or reason',
    example: 'Updated via Tienda webhook'
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  statusMessage?: string;
}

export class TransactionFiltersDataDto {
  @ApiPropertyOptional({ 
    description: 'Filter by transaction status',
    enum: ['PENDING', 'APPROVED', 'DECLINED', 'ERROR', 'CANCELLED', 'REFUNDED'],
    example: 'APPROVED'
  })
  @IsOptional()
  @IsEnum(['PENDING', 'APPROVED', 'DECLINED', 'ERROR', 'CANCELLED', 'REFUNDED'])
  status?: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR' | 'CANCELLED' | 'REFUNDED';

  @ApiPropertyOptional({ 
    description: 'Filter by customer email',
    example: 'customer@example.com'
  })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by customer name',
    example: 'Juan Pérez'
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  customerName?: string;

  @ApiPropertyOptional({ 
    description: 'Filter from date (ISO string)',
    example: '2024-01-01T00:00:00.000Z'
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: Date;

  @ApiPropertyOptional({ 
    description: 'Filter to date (ISO string)',
    example: '2024-12-31T23:59:59.999Z'
  })
  @IsOptional()
  @IsDateString()
  dateTo?: Date;

  @ApiPropertyOptional({ 
    description: 'Filter by Tienda transaction ID',
    example: '01-1532941443-49201'
  })
  @IsOptional()
  @IsString()
  TiendaTransactionId?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by transaction reference',
    example: 'TXN_1640995200000_ABC123'
  })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by minimum amount in cents',
    example: 10000
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  amountFrom?: number;

  @ApiPropertyOptional({ 
    description: 'Filter by maximum amount in cents',
    example: 100000
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  amountTo?: number;

  @ApiPropertyOptional({ 
    description: 'Filter by payment method',
    enum: ['CREDIT_CARD', 'DEBIT_CARD', 'PSE', 'NEQUI', 'DAVIPLATA'],
    example: 'CREDIT_CARD'
  })
  @IsOptional()
  @IsEnum(['CREDIT_CARD', 'DEBIT_CARD', 'PSE', 'NEQUI', 'DAVIPLATA'])
  paymentMethod?: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PSE' | 'NEQUI' | 'DAVIPLATA';

  @ApiPropertyOptional({ 
    description: 'Filter transactions with delivery',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  hasDelivery?: boolean;

  @ApiPropertyOptional({ 
    description: 'Filter by delivery status',
    example: 'SHIPPED'
  })
  @IsOptional()
  @IsString()
  deliveryStatus?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by product ID',
    example: 'prod-12345'
  })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by product category',
    example: 'electronics'
  })
  @IsOptional()
  @IsString()
  categoryId?: string;
}

// ✅ DTO para actualizar estado de delivery - Step 5 del flujo según test
export class DeliveryStatusUpdateDto {
  @ApiProperty({ 
    description: 'New delivery status',
    enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'],
    example: 'SHIPPED'
  })
  @IsEnum(['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'])
  deliveryStatus: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'SHIPPED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

  @ApiPropertyOptional({ 
    description: 'Tracking code for delivery',
    example: 'TRACK_TXN_1234567890_ABC123'
  })
  @IsOptional()
  @IsString()
  @Length(5, 100)
  trackingCode?: string;

  @ApiPropertyOptional({ 
    description: 'Estimated delivery date in ISO format',
    example: '2024-01-15T10:00:00.000Z'
  })
  @IsOptional()
  @IsDateString()
  estimatedDeliveryDate?: string;

  @ApiPropertyOptional({ 
    description: 'Additional delivery notes',
    example: 'Package left at front door as requested'
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  deliveryNotes?: string;
}

// ✅ DTO para filtros de transacciones según especificaciones del test
export class TransactionFiltersDto {
  @ApiPropertyOptional({ 
    description: 'Page number for pagination',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ 
    description: 'Items per page limit',
    example: 10,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ 
    description: 'Field to sort by',
    example: 'createdAt',
    enum: ['createdAt', 'updatedAt', 'amount', 'status']
  })
  @IsOptional()
  @IsString()
  @IsEnum(['createdAt', 'updatedAt', 'amount', 'status'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ 
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc']
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ 
    description: 'Advanced filters',
    type: () => TransactionFiltersDataDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TransactionFiltersDataDto)
  filters?: TransactionFiltersDataDto;
}

// ✅ DTO para datos de filtros según especificaciones del test


// ✅ DTO para webhook de Tienda según especificaciones exactas del test
export class TiendaWebhookDto {
  @ApiProperty({ 
    description: 'Tienda event type',
    example: 'transaction.updated'
  })
  @IsString()
  event: string;

  @ApiProperty({ 
    description: 'Event data from Tienda',
    example: {
      transaction: {
        id: '01-1532941443-49201',
        amount_in_cents: 4490000,
        reference: 'MZQ3X2DE2SMX',
        customer_email: 'john.doe@gmail.com',
        currency: 'COP',
        payment_method_type: 'NEQUI',
        status: 'APPROVED'
      }
    }
  })
  data: {
    transaction: {
      id: string;
      amount_in_cents: number;
      reference: string;
      customer_email: string;
      currency: string;
      payment_method_type: string;
      status: 'APPROVED' | 'DECLINED' | 'ERROR' | 'VOIDED';
    };
  };

  @ApiProperty({ 
    description: 'Event sent timestamp',
    example: '2018-07-20T16:45:05.000Z'
  })
  @IsDateString()
  sent_at: string;

  @ApiPropertyOptional({ 
    description: 'Signature for webhook validation',
    example: {
      properties: ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'],
      checksum: '3476DDA50F64CD7CBD160689640506FEBEA93239BC524FC0469B2C68A3CC8BD0'
    }
  })
  @IsOptional()
  signature?: {
    properties: string[];
    checksum: string;
  };

  @ApiProperty({ 
    description: 'Unix timestamp for signature validation',
    example: 1530291411
  })
  @IsNumber()
  timestamp: number;
}

// ✅ DTO para respuesta de transacción según especificaciones del test
export class TransactionResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Transaction created successfully according to Tienda 5-step process' })
  message: string;

  @ApiProperty({ example: 201 })
  statusCode: number;

  @ApiPropertyOptional()
  data?: any;

  @ApiPropertyOptional()
  error?: string;

  @ApiPropertyOptional()
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}
