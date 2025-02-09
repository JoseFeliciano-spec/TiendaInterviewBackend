export class CrudStockMovementDto {
  id?: string;
  productId?: string;
  type?: 'entrada' | 'salida';
  quantity?: number;
  date?: Date;
}
