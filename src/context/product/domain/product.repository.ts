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
export abstract class ProductRepository {
  abstract findAll(filters?: ProductFilters, page?: number, limit?: number): Promise<ProductListResponse>;
}
