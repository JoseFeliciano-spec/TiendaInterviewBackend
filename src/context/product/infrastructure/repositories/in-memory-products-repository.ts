import { Injectable, BadRequestException } from '@nestjs/common';
import { ProductRepository, ProductFilters, ProductListResponse } from '@/context/product/domain/product.repository';
import { PrismaService } from '@/context/shared/database/prisma.service';
import { Product } from '../../domain/product.entity';

@Injectable()
export class InMemoryProductRepository extends ProductRepository {
  constructor(private prisma: PrismaService) {
    super();
  }

  async findAll(
    filters?: ProductFilters, 
    page: number = 1, 
    limit: number = 10
  ): Promise<ProductListResponse> {
    try {
      const skip = (page - 1) * limit;
      
      // Construir WHERE clause según filtros proporcionados
      const where: any = {
        isActive: true, // Solo productos activos según especificaciones del test
      };

      // Aplicar filtros si existen
      if (filters) {
        if (filters.category) {
          where.category = {
            equals: filters.category,
            mode: 'insensitive'
          };
        }
        
        if (filters.featured !== undefined) {
          where.featured = filters.featured;
        }
        
        if (filters.inStock) {
          where.stock = { gt: 0 };
        }
        
        // Filtros de precio (convertir a centavos para la BD)
        if (filters.minPrice || filters.maxPrice) {
          where.price = {};
          if (filters.minPrice) where.price.gte = Math.round(filters.minPrice * 100);
          if (filters.maxPrice) where.price.lte = Math.round(filters.maxPrice * 100);
        }
        
        // Filtros por tags
        if (filters.tags && filters.tags.length > 0) {
          where.tags = { hasSome: filters.tags };
        }
        
        // Búsqueda de texto (nombre, descripción, tags)
        if (filters.search) {
          where.OR = [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
            { tags: { hasSome: [filters.search] } }
          ];
        }
      }

      // Ejecutar consultas en paralelo para mejor performance
      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: [
            { featured: 'desc' }, // Productos destacados primero
            { createdAt: 'desc' }  // Más recientes después
          ]
        }),
        this.prisma.product.count({ where })
      ]);

      // Calcular paginación
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      // Mapear productos a entidades de dominio
      const productEntities = products.map(product => this.mapPrismaToProduct(product));

      return {
        products: productEntities,
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev
      };

    } catch (error) {
      console.error('Error fetching products:', error);
      throw new BadRequestException('Error al obtener productos de la base de datos');
    }
  }

  private mapPrismaToProduct(prismaProduct: any): Product {
    return Product.fromPrimitives({
      id: prismaProduct.id,
      name: prismaProduct.name,
      description: prismaProduct.description,
      price: prismaProduct.price, // Mantener en centavos para cálculos internos
      originalPrice: prismaProduct.originalPrice || undefined,
      image: prismaProduct.image,
      category: prismaProduct.category,
      stock: prismaProduct.stock,
      rating: prismaProduct.rating,
      reviews: prismaProduct.reviews,
      tags: prismaProduct.tags,
      featured: prismaProduct.featured,
      discount: prismaProduct.discount || undefined,
      sku: prismaProduct.sku,
      isActive: prismaProduct.isActive,
      createdAt: prismaProduct.createdAt,
      updatedAt: prismaProduct.updatedAt,
    });
  }
}
