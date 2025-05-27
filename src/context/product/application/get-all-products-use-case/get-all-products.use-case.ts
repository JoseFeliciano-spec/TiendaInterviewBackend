import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductRepository, ProductFilters, ProductListResponse } from '@/context/product/domain/product.repository';

interface GetAllProductsUseCaseParams {
  page?: number;
  limit?: number;
  category?: string;
  featured?: boolean;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class GetAllProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async run({
    page = 1,
    limit = 10,
    category,
    featured,
    inStock = false,
    minPrice,
    maxPrice,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  }: GetAllProductsUseCaseParams): Promise<ProductListResponse> {
    try {
      // Validaciones según especificaciones del test de Tienda
      if (page < 1) {
        throw new BadRequestException('Page must be greater than 0');
      }

      if (limit < 1 || limit > 100) {
        throw new BadRequestException('Limit must be between 1 and 100');
      }

      // Validar filtros de precio
      if (minPrice && minPrice < 0) {
        throw new BadRequestException('Minimum price cannot be negative');
      }

      if (maxPrice && maxPrice < 0) {
        throw new BadRequestException('Maximum price cannot be negative');
      }

      if (minPrice && maxPrice && minPrice > maxPrice) {
        throw new BadRequestException('Minimum price cannot be greater than maximum price');
      }

      // Validar parámetros de ordenamiento
      const validSortFields = ['name', 'price', 'rating', 'createdAt'];
      if (!validSortFields.includes(sortBy)) {
        throw new BadRequestException(`Sort field must be one of: ${validSortFields.join(', ')}`);
      }

      const validSortOrders = ['asc', 'desc'];
      if (!validSortOrders.includes(sortOrder)) {
        throw new BadRequestException('Sort order must be asc or desc');
      }

      // Normalizar categoría si existe
      const normalizedCategory = category?.toLowerCase().trim();
      if (normalizedCategory && normalizedCategory.length < 2) {
        throw new BadRequestException('Category must be at least 2 characters');
      }

      // Crear filtros
      const filters: ProductFilters = {
        category: normalizedCategory,
        featured,
        inStock,
        minPrice,
        maxPrice
      };

      // Limpiar filtros undefined
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof ProductFilters] === undefined) {
          delete filters[key as keyof ProductFilters];
        }
      });

      // Obtener productos con filtros aplicados
      const result = await this.productRepository.findAll(
        Object.keys(filters).length > 0 ? filters : undefined,
        page,
        limit
      );

      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al obtener todos los productos');
    }
  }
}
