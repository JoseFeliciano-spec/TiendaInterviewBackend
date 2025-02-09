import { Injectable } from '@nestjs/common';
import { Product, PrimitiveProduct } from '@/context/product/domain/product.entity';
import { ProductRepository } from '@/context/product/domain/product.repository';
import { CrudProductDto } from './crud-product.dto';

@Injectable()
export class ProductUseCases {
  constructor(private readonly productRepository: ProductRepository) {}

  async createProduct(
    dto: CrudProductDto,
  ): Promise<{ data: PrimitiveProduct; message: string; statusCode: number }> {
    const product = Product.create(dto as any);
    const savedProduct = await this.productRepository.create(product);

    return savedProduct;
  }

  async updateProduct(
    dto: CrudProductDto,
  ): Promise<{ data: PrimitiveProduct; message: string; statusCode: number }> {
    const product = Product.update(dto as any);
    const updatedProduct = await this.productRepository.update(product);
    return updatedProduct;
  }

  async getAllProducts(id: string): Promise<{
    data: PrimitiveProduct[];
    message: string;
    statusCode: number;
  }> {
    const products = await this.productRepository.getAll(id);
    return products;
  }

  async getProductById(id: string): Promise<any> {
    const product = await this.productRepository.getProductById(id);
    return product;
  }

  async deleteProduct(
    id: string,
  ): Promise<{ message: string; statusCode: number }> {
    const productDelete = await this.productRepository.deleteProduct(id);
    return productDelete;
  }
}