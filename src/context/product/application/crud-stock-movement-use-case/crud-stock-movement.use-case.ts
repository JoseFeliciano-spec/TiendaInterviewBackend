import { Injectable } from '@nestjs/common';
import {
  StockMovement,
  PrimitiveStockMovement,
} from '@/context/product/domain/stock-movement/stock-movement.entity';
import { StockMovementRepository } from '@/context/product/domain/stock-movement/stock-movement.repository';
import { CrudProductDto } from '../crud-product-use-case/crud-product.dto';

@Injectable()
export class StockMovementUseCases {
  constructor(
    private readonly stockMovementRepository: StockMovementRepository,
  ) {}

  async registerMovement(dto: CrudProductDto): Promise<{
    data: PrimitiveStockMovement;
    message: string;
    statusCode: number;
  }> {
    const movement = StockMovement.create(dto as any);
    return this.stockMovementRepository.registerMovement(movement);
  }

  async getAllMovements(): Promise<{
    data: PrimitiveStockMovement[];
    message: string;
    statusCode: number;
  }> {
    return this.stockMovementRepository.getAllMovements();
  }

  async getMovementById(id: string): Promise<{
    data: PrimitiveStockMovement | null;
    message: string;
    statusCode: number;
  }> {
    return this.stockMovementRepository.getMovementById(id);
  }

  async updateMovement(dto: CrudProductDto): Promise<{
    data: PrimitiveStockMovement | null;
    message: string;
    statusCode: number;
  }> {
    const movement = StockMovement.create(dto as any);
    return this.stockMovementRepository.updateMovement(movement);
  }

  async deleteMovement(id: string): Promise<{
    data: { id: string } | null;
    message: string;
    statusCode: number;
  }> {
    return this.stockMovementRepository.deleteMovement(id);
  }
}
