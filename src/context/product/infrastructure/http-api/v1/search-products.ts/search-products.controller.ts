import {
  Controller,
  Get,
  Query,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiQuery,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { SearchProductsUseCase } from '@/context/product/application/search-products-use-case/get-search-products.use-case';

@ApiTags('Productos') // Translated
@Controller('api/v1/products')
export class SearchProductsController {
  constructor(private readonly searchProductsUseCase: SearchProductsUseCase) {}

  /**
   * Busca productos por término, nombre, URL o slug
   * Soporta filtros avanzados y paginación según especificaciones del test
   */
  @Get('search')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({
    summary: 'Buscar productos por término, nombre, URL o slug', // Translated
    description: `
      Endpoint de búsqueda inteligente de productos que soporta múltiples métodos de búsqueda:
      
      **Tipos de Búsqueda:**
      - Nombre del producto: "iPhone 15 Pro"
      - Términos en descripción: "smartphone premium"
      - Etiquetas del producto: "5g", "premium"
      - URLs: "https://store.com/products/iphone-15-pro"
      - Slugs: "apple-iphone-15-pro-max"
      
      **Características:**
      - Detección y análisis inteligente de URLs/slugs
      - Búsqueda de respaldo para mejores resultados
      - Filtros combinados (categoría, rango de precios)
      - Paginación optimizada para diseño mobile-first
      - Solo devuelve productos en stock
    `, // Translated
    operationId: 'searchProducts',
  })
  @ApiQuery({
    name: 'q',
    description: 'Search query - product name, URL, slug, or description term',
    example: 'iPhone 15 Pro',
    required: true,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number for pagination',
    example: 1,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Products per page (max 50 for search)',
    example: 10,
    required: false,
  })
  @ApiQuery({
    name: 'category',
    description: 'Filter by product category',
    example: 'smartphones',
    required: false,
  })
  @ApiQuery({
    name: 'minPrice',
    description: 'Minimum price filter in pesos',
    example: 100,
    required: false,
  })
  @ApiQuery({
    name: 'maxPrice',
    description: 'Maximum price filter in pesos',
    example: 1000,
    required: false,
  })
  @ApiOkResponse({
    description: 'Products found successfully',
    schema: {
      example: {
        success: true,
        data: {
          products: [
            {
              id: 'prod_001',
              name: 'iPhone 15 Pro Max 256GB',
              description: 'El smartphone más avanzado con chip A17 Pro',
              price: 4999999,
              originalPrice: 5499999,
              image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5',
              category: 'smartphones',
              stock: 15,
              rating: 4.9,
              reviews: 324,
              tags: ['premium', 'nuevo', '5g'],
              featured: true,
              discount: 9,
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
        message: 'Products search completed successfully',
        statusCode: 200,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid search parameters',
    schema: {
      example: {
        success: false,
        message: 'Search query is required',
        statusCode: 400,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'No products found for the search criteria',
    schema: {
      example: {
        success: false,
        message: 'No products found for your search',
        statusCode: 404,
      },
    },
  })
  async searchProducts(
    @Query() searchParams: any
  ): Promise<any> {
    try {
      // Ejecutar use case con parámetros validados
      const result = await this.searchProductsUseCase.run({
        query: searchParams.q,
        page: searchParams.page || 1,
        limit: searchParams.limit || 10,
        category: searchParams.category,
        minPrice: searchParams.minPrice,
        maxPrice: searchParams.maxPrice,
      });

      // Mapear resultado a DTO de respuesta según especificaciones del test
      const responseData: any = {
        success: true,
        data: {
          products: result.products.map(product => {
            const primitives = product.toPrimitives();
            return {
              id: primitives.id!,
              name: primitives.name!,
              description: primitives.description!,
              price: primitives.price! / 100, // Convertir de centavos a pesos para frontend
              originalPrice: primitives.originalPrice ? primitives.originalPrice / 100 : undefined,
              image: primitives.image!,
              category: primitives.category!,
              stock: primitives.stock!,
              rating: primitives.rating!,
              reviews: primitives.reviews!,
              tags: primitives.tags!,
              featured: primitives.featured!,
              discount: primitives.discount,
            };
          }),
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
        message: result.total > 0 
          ? 'Products search completed successfully'
          : 'No products found for your search',
        statusCode: HttpStatus.OK,
      };

      return responseData;
    } catch (error) {
      // El manejo de errores específicos ya está en el use case
      throw error;
    }
  }
}
