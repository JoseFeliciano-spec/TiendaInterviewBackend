export interface PrimitiveStockMovement {
  id?: string;
  productId: string;
  type: 'entrada' | 'salida';
  quantity: number;
  date: Date;
}

export class StockMovement {
  constructor(private attributes: PrimitiveStockMovement) {}

  static create(createMovement: {
    productId: string;
    type: 'entrada' | 'salida';
    quantity: number;
    date?: Date;
  }): StockMovement {
    return new StockMovement({
      productId: createMovement.productId,
      type: createMovement.type,
      quantity: createMovement.quantity,
      date: createMovement.date || new Date(),
    });
  }

  toPrimitives(): PrimitiveStockMovement {
    return {
      id: this.attributes.id,
      productId: this.attributes.productId,
      type: this.attributes.type,
      quantity: this.attributes.quantity,
      date: this.attributes.date,
    };
  }
}
