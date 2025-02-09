import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StockMovementController } from '../http-api/v1/crud-stock-movement.ts/crud-stock-movement.controller';
import { StockMovementUseCases } from '../../application/crud-stock-movement-use-case/crud-stock-movement.use-case';
import { StockMovementRepository } from '../../domain/stock-movement/stock-movement.repository';
import { InMemoryCrudStockMovementRepository } from '../repositories/stock-repository/in-memory-crud-stock-movement';
import {
  StockMovementMongoSchema,
  StockMovementMongo,
} from '../schema/stock.schema';
import { ProductMongo, ProductMongoSchema } from '../schema/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StockMovementMongo.name, schema: StockMovementMongoSchema },
    ]),
    MongooseModule.forFeature([
      { name: ProductMongo.name, schema: ProductMongoSchema },
    ]),
  ],
  controllers: [StockMovementController],
  providers: [
    StockMovementUseCases,
    InMemoryCrudStockMovementRepository,
    {
      provide: StockMovementRepository,
      useExisting: InMemoryCrudStockMovementRepository,
    },
  ],
  exports: [StockMovementUseCases],
})
export class StockMovementModules {}
