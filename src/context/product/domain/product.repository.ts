import {
  Product,
} from '@/context/product/domain/product.entity';

// Interfaz para el repositorio de productos
export abstract class ProductRepository {
  // Métodos abstractos que deben implementarse en la clase concreta
  abstract create(product: Product): Promise<any>;
  abstract deleteProduct(id: string): Promise<any>;
  abstract getAll(id: string): Promise<any>;
  abstract update(product: Product): Promise<any>;
  abstract getProductById(id: string): Promise<any>;
}