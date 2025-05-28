import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TransactionController } from './http-api/v1/transactions.ts/transaction.controller';
import { TransactionUseCases } from '../application/transaction-use-case/transaction.use-case';
import { TransactionRepository } from '../domain/transaction.repository';
import { InMemoryProductRepository } from '@/context/product/infrastructure/repositories/in-memory-products-repository';
import { ProductsModule } from '@/context/product/infrastructure/products.module';
import { WompiModule } from '../../shared/wompi/wompi.module';
import { PrismaService } from '@/context/shared/database/prisma.service';
import { ProductRepository } from '@/context/product/domain/product.repository';
import { InMemoryTransactionRepository } from './repositories/in-memory-transaction-repository';

@Module({
  imports: [
    ConfigModule, // ✅ Para ConfigService
    ProductsModule, // ✅ CLAVE: Importar ProductModule para acceder a ProductRepository
    WompiModule, // ✅ Para WompiService
  ],
  controllers: [TransactionController],
  providers: [
    PrismaService,
    TransactionUseCases,
    InMemoryProductRepository,
    InMemoryTransactionRepository,
    {
      provide: TransactionRepository,
      useExisting: InMemoryTransactionRepository,
    },
    {
      provide: ProductRepository,
      useExisting: InMemoryProductRepository
    }
  ],
  exports: [TransactionRepository, TransactionUseCases],
})
export class TransactionModule {}
