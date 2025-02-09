import { StockMovement } from './stock-movement.entity';

export abstract class StockMovementRepository {
  abstract registerMovement(movement: StockMovement): Promise<any>;

  abstract getAllMovements(): Promise<any>;

  abstract getMovementById(id: string): Promise<any>;

  abstract updateMovement(movement: StockMovement): Promise<any>;

  abstract deleteMovement(id: string): Promise<any>;
}
