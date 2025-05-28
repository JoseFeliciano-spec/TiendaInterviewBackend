import { Product } from './product.entity';

export interface ProductFilters {
  category?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  tags?: string[];
  search?: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Port según Hexagonal Architecture del test
export abstract class ProductRepository {
  // Método existente
  abstract findAll(
    filters?: ProductFilters, 
    page?: number, 
    limit?: number
  ): Promise<ProductListResponse>;

  // findById requerido por TransactionUseCases según search results
  abstract findById(id: string): Promise<Product | null>;

  // Métodos adicionales según especificaciones del test de la Tienda
  abstract findBySku(sku: string): Promise<Product | null>;
  abstract updateStock(id: string, quantity: number): Promise<Product>;
  abstract checkStock(id: string, quantity: number): Promise<boolean>;
}
