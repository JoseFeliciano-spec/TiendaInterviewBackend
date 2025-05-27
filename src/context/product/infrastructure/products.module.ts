import { Module } from '@nestjs/common';
import { SearchProductsController } from './http-api/v1/search-products.ts/search-products.controller';
import { GetAllProductsUseCase } from '../application/get-all-products-use-case/get-all-products.use-case';
import { PrismaModule } from '@/context/shared/database/prisma.module';
import { SearchProductsUseCase } from '../application/search-products-use-case/get-search-products.use-case';
import { InMemoryProductRepository } from './repositories/in-memory-products-repository';
import { ProductRepository } from '../domain/product.repository';
import { ProductController } from './http-api/v1/get-all-products.ts/get-all.products.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SearchProductsController, ProductController],
  providers: [
    GetAllProductsUseCase,
    SearchProductsUseCase,
    InMemoryProductRepository,
    {
      provide: ProductRepository,
      useExisting: InMemoryProductRepository,
    },
  ],
  exports: [GetAllProductsUseCase, SearchProductsUseCase],
})
export class ProductsModule {}
