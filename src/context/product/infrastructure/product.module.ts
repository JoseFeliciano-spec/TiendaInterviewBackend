import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductMongo, ProductMongoSchema } from './schema/product.schema';
import { ProductController } from './http-api/v1/crud-product.ts/crud-product.controller';
import { ProductUseCases } from '../application/crud-product-use-case/crud-product.use-case';
import { InMemoryCrudProductRepository } from './repositories/in-memory-crud-product-repository';
import { ProductRepository } from '../domain/product.repository';
import {
  NotificationMongo,
  NotificationMongoSchema,
} from '@/context/product/infrastructure/schema/notifier.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductMongo.name, schema: ProductMongoSchema },
    ]),
    MongooseModule.forFeature([
      { name: NotificationMongo.name, schema: NotificationMongoSchema },
    ]),
  ],
  controllers: [ProductController],
  providers: [
    ProductUseCases,
    InMemoryCrudProductRepository,
    {
      provide: ProductRepository,
      useExisting: InMemoryCrudProductRepository,
    },
  ],
  exports: [ProductUseCases],
})
export class ProductModules {}
