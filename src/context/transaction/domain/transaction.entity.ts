// Interface mínima según especificaciones del test
export interface MinimalTransaction {
  id: string;
  reference: string;
  status: TransactionStatus;
  productId: string;
  productName: string;
  quantity: number;
  amount: number; // En centavos según Wompi
  customerEmail: string;
  createdAt: Date;
}

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly reference: string,
    public readonly status: TransactionStatus,
    public readonly productId: string,
    public readonly productName: string,
    public readonly quantity: number,
    public readonly amount: number, // Total en centavos según Wompi
    public readonly customerEmail: string,
    public readonly wompiTransactionId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  // Factory method mínimo según especificaciones del test
  static create(data: {
    productId: string;
    productName: string;
    quantity: number;
    productPrice: number; // En centavos
    customerEmail: string;
  }): Transaction {
    const reference = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    // Cálculo según especificaciones exactas del test de la Tienda
    const subtotal = data.productPrice * data.quantity;
    const baseFee = 500; // 5000 pesos en centavos según documento PDF
    const deliveryFee = subtotal > 5000000 ? 0 : 800; // 8000 pesos, gratis > 50k
    const totalAmount = subtotal + baseFee + deliveryFee;
    
    return new Transaction(
      crypto.randomUUID(),
      reference,
      TransactionStatus.PENDING,
      data.productId,
      data.productName,
      data.quantity,
      totalAmount,
      data.customerEmail,
      null, // wompiTransactionId
      new Date(),
      new Date()
    );
  }

  updateStatus(status: TransactionStatus, wompiTransactionId?: string): Transaction {
    return new Transaction(
      this.id,
      this.reference,
      status,
      this.productId,
      this.productName,
      this.quantity,
      this.amount,
      this.customerEmail,
      wompiTransactionId || this.wompiTransactionId,
      this.createdAt,
      new Date()
    );
  }

  toPrimitives(): MinimalTransaction {
    return {
      id: this.id,
      reference: this.reference,
      status: this.status,
      productId: this.productId,
      productName: this.productName,
      quantity: this.quantity,
      amount: this.amount,
      customerEmail: this.customerEmail,
      createdAt: this.createdAt,
    };
  }

  isPending(): boolean {
    return this.status === TransactionStatus.PENDING;
  }

  isApproved(): boolean {
    return this.status === TransactionStatus.APPROVED;
  }
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  ERROR = 'ERROR'
}
