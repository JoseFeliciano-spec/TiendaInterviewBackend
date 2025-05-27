// src/context/product/application/SearchProductsUseCase.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { ProductRepository, ProductFilters, ProductListResponse } from '@/context/product/domain/product.repository';

interface SearchProductsUseCaseParams {
  query: string;
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

@Injectable()
export class SearchProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async run({
    query,
    page = 1,
    limit = 10,
    category,
    minPrice,
    maxPrice
  }: SearchProductsUseCaseParams): Promise<ProductListResponse> {
    try {
      // Validaciones básicas
      if (!query?.trim()) {
        throw new BadRequestException('Search query is required');
      }

      if (query.trim().length < 2) {
        throw new BadRequestException('Search query must be at least 2 characters');
      }

      if (page < 1) {
        throw new BadRequestException('Page must be greater than 0');
      }

      if (limit < 1 || limit > 50) {
        throw new BadRequestException('Limit must be between 1 and 50');
      }

      // Normalizar query para búsqueda case-insensitive
      const searchTerm = this.normalizeQuery(query.trim());

      // Crear filtros
      const filters: ProductFilters = {
        search: searchTerm,
        inStock: true // Solo productos en stock según test de Wompi
      };

      // Agregar filtros opcionales
      if (category) filters.category = category.toLowerCase();
      if (minPrice) filters.minPrice = minPrice;
      if (maxPrice) filters.maxPrice = maxPrice;

      // Buscar productos
      const result = await this.productRepository.findAll(filters, page, limit);

      // Fallback simple si no hay resultados
      if (result.total === 0 && searchTerm.length > 3) {
        const fallbackFilters: ProductFilters = {
          search: searchTerm.substring(0, Math.floor(searchTerm.length * 0.7)),
          inStock: true
        };

        return await this.productRepository.findAll(fallbackFilters, page, limit);
      }

      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al buscar productos');
    }
  }

  /**
   * Normaliza query para búsqueda case-insensitive
   * Convierte slugs a términos de búsqueda
   */
  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .replace(/-/g, ' ') // Convertir guiones a espacios: airpods-pro → airpods pro
      .replace(/\s+/g, ' ') // Normalizar espacios múltiples
      .trim();
  }
}
