import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import {
  ProductRepository,
  ProductFilters,
  ProductListResponse,
} from '@/context/product/domain/product.repository';
import { PrismaService } from '@/context/shared/database/prisma.service';
import { Product } from '../../domain/product.entity';

@Injectable()
export class InMemoryProductRepository extends ProductRepository {
  private readonly logger = new Logger(ProductRepository.name);
  constructor(private prisma: PrismaService) {
    super();
  }

   async findById(id: string): Promise<Product | null> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id }
      });

      if (!product || !product.isActive) {
        this.logger.log(`❌ Product not found or inactive: ${id}`);
        return null;
      }

      this.logger.log(`✅ Product found: ${product.name} - Stock: ${product.stock} - Price: ${Number(product.price) / 100} pesos`);
      return this.mapPrismaToProduct(product);
    } catch (error) {
      this.logger.error(`❌ Error finding product by ID: ${error.message}`);
      throw new BadRequestException(`Error finding product: ${error.message}`);
    }
  }
  
  findBySku(sku: string): Promise<Product | null> {
    throw new Error('Method not implemented.');
  }
  updateStock(id: string, quantity: number): Promise<Product> {
    throw new Error('Method not implemented.');
  }

  async checkStock(id: string, quantity: number): Promise<boolean> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
        select: { stock: true, isActive: true, name: true }
      });

      if (!product || !product.isActive) {
        this.logger.log(`❌ Product not found or inactive for stock check: ${id}`);
        return false;
      }

      const hasStock = product.stock >= quantity;
      this.logger.log(`📊 Stock check: ${product.name} - Required: ${quantity}, Available: ${product.stock}, Has stock: ${hasStock}`);
      
      return hasStock;
    } catch (error) {
      this.logger.error(`❌ Error checking stock: ${error.message}`);
      return false;
    }
  }

  async findAll(
    filters?: ProductFilters,
    page: number = 1,
    limit: number = 10,
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
            mode: 'insensitive',
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
          if (filters.minPrice)
            where.price.gte = Math.round(filters.minPrice * 100);
          if (filters.maxPrice)
            where.price.lte = Math.round(filters.maxPrice * 100);
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
            { tags: { hasSome: [filters.search] } },
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
            { createdAt: 'desc' }, // Más recientes después
          ],
        }),
        this.prisma.product.count({ where }),
      ]);

      // Calcular paginación
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      // Mapear productos a entidades de dominio
      const productEntities = products.map((product) =>
        this.mapPrismaToProduct(product),
      );

      return {
        products: productEntities,
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev,
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new BadRequestException(
        'Error al obtener productos de la base de datos',
      );
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
