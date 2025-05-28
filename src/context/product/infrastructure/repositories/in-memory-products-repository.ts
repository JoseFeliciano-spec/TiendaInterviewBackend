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

  async findByUser(idUser: string): Promise<{
    success: boolean;
    data?: {
      transactions: any[];
      products: any[];
      summary: {
        totalTransactions: number;
        totalProducts: number;
        totalSpent: number; // En pesos
        byStatus: Record<string, number>;
        lastPurchase?: Date;
      };
    };
    message: string;
    statusCode: number;
  }> {
    try {
      this.logger.log(
        `🔍 Finding optimized transactions with products for user: ${idUser}`,
      );

      // ✅ Query ultra-optimizada según search results [3], [6], [7] - Una sola consulta con todos los includes
      const [userTransactions, totalCount] = await this.prisma.$transaction([
        // Query principal optimizada: TransactionItems como punto de partida según search result [7]
        this.prisma.transaction.findMany({
          where: {
            OR: [
              { userId: idUser }, // Usuario registrado según schema
              { customerEmail: idUser }, // Usuario guest según test de Wompi del search result [1]
            ],
          },
          select: {
            // ✅ Select específico en lugar de include completo según search result [7] para performance
            id: true,
            reference: true,
            status: true,
            amount: true,
            subtotal: true,
            baseFee: true,
            deliveryFee: true,
            wompiTransactionId: true,
            paymentMethod: true,
            customerName: true,
            customerEmail: true,
            customerPhone: true,
            customerDocument: true,
            createdAt: true,
            updatedAt: true,

            // ✅ Usuario registrado (select específico según search result [7])
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },

            // ✅ Delivery info optimizada según schema
            delivery: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                address: true,
                city: true,
                department: true,
                status: true,
                estimatedDate: true,
                deliveredAt: true,
                trackingCode: true,
              },
            },

            // ✅ TransactionItems con productos - nested include optimizado según search results [3], [7]
            transactionItems: {
              select: {
                id: true,
                quantity: true,
                unitPrice: true,
                totalPrice: true,
                productId: true,

                // ✅ Producto con campos específicos según search result [7]
                product: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    originalPrice: true,
                    image: true,
                    category: true,
                    stock: true,
                    rating: true,
                    reviews: true,
                    tags: true,
                    featured: true,
                    discount: true,
                    sku: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc', // ✅ Más recientes primero según search result [3]
          },
        }),

        // Count optimizado según search result [4]
        this.prisma.transaction.count({
          where: {
            OR: [{ userId: idUser }, { customerEmail: idUser }],
          },
        }),
      ]);

      this.logger.log(
        `✅ Found ${userTransactions.length} transactions for user: ${idUser}`,
      );

      if (userTransactions.length === 0) {
        return {
          success: true,
          data: {
            transactions: [],
            products: [],
            summary: {
              totalTransactions: 0,
              totalProducts: 0,
              totalSpent: 0,
              byStatus: {},
            },
          },
          message: 'No transactions found for this user',
          statusCode: 200,
        };
      }

      // ✅ Procesamiento optimizado en memoria según especificaciones del test de Wompi del search result [1]
      const uniqueProductsMap = new Map();
      const statusCounts: Record<string, number> = {};
      let totalSpent = 0;
      let lastPurchaseDate: Date | undefined;

      // ✅ Mapear transacciones con productos de forma optimizada
      const processedTransactions = userTransactions.map((transaction) => {
        // Calcular totales según especificaciones del test
        const transactionAmount = Number(transaction.amount) / 100; // Centavos a pesos
        totalSpent += transactionAmount;

        // Contar por status para estadísticas
        statusCounts[transaction.status] =
          (statusCounts[transaction.status] || 0) + 1;

        // Fecha de última compra
        if (!lastPurchaseDate || transaction.createdAt > lastPurchaseDate) {
          lastPurchaseDate = transaction.createdAt;
        }

        // ✅ Procesar items optimizado - evitando loops anidados según search result [7]
        const processedItems = transaction.transactionItems.map((item) => {
          const product = item.product;

          // ✅ Agregar producto único al Map de forma eficiente
          if (product && !uniqueProductsMap.has(item.productId)) {
            uniqueProductsMap.set(item.productId, {
              // ✅ Mapeo directo sin conversión innecesaria
              id: product.id,
              name: product.name,
              description: product.description,
              price: Number(product.price) / 100, // En pesos para display
              originalPrice: product.originalPrice
                ? Number(product.originalPrice) / 100
                : null,
              image: product.image,
              category: product.category,
              stock: product.stock,
              rating: product.rating,
              reviews: product.reviews,
              tags: product.tags,
              featured: product.featured,
              discount: product.discount,
              sku: product.sku,
              isActive: product.isActive,
              createdAt: product.createdAt,
              updatedAt: product.updatedAt,

              // ✅ Datos de compra según especificaciones del test
              purchaseHistory: {
                quantity: item.quantity,
                unitPrice: Number(item.unitPrice) / 100, // En pesos
                totalPrice: Number(item.totalPrice) / 100, // En pesos
                purchaseDate: transaction.createdAt,
                transactionReference: transaction.reference,
                transactionStatus: transaction.status,
              },
            });
          }

          // ✅ Retornar item procesado según search result [1]
          return {
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice) / 100, // En pesos
            totalPrice: Number(item.totalPrice) / 100, // En pesos
            product: {
              id: product.id,
              name: product.name,
              description: product.description,
              price: Number(product.price) / 100, // En pesos
              image: product.image,
              category: product.category,
              stock: product.stock,
              rating: product.rating,
              sku: product.sku,
              isActive: product.isActive,
            },
          };
        });

        // ✅ Retornar transacción completa según especificaciones del test
        return {
          id: transaction.id,
          reference: transaction.reference,
          status: transaction.status,
          amount: transactionAmount, // En pesos
          subtotal: Number(transaction.subtotal) / 100, // En pesos
          baseFee: Number(transaction.baseFee) / 100, // En pesos
          deliveryFee: Number(transaction.deliveryFee) / 100, // En pesos
          wompiTransactionId: transaction.wompiTransactionId,
          paymentMethod: transaction.paymentMethod,

          // Datos del cliente
          customerName: transaction.customerName,
          customerEmail: transaction.customerEmail,
          customerPhone: transaction.customerPhone,
          customerDocument: transaction.customerDocument,

          // Usuario registrado (si existe)
          user: transaction.user,

          // Delivery optimizado
          delivery: transaction.delivery,

          // Items procesados
          transactionItems: processedItems,

          // Fechas
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
        };
      });

      // ✅ Extraer productos únicos del Map de forma eficiente
      const uniqueProducts = Array.from(uniqueProductsMap.values());

      this.logger.log(
        `📊 Optimized summary: ${uniqueProducts.length} unique products, ${totalCount} transactions, $${totalSpent.toFixed(2)} spent`,
      );
      this.logger.log(`📈 Status breakdown: ${JSON.stringify(statusCounts)}`);

      return {
        success: true,
        data: {
          transactions: processedTransactions,
          products: uniqueProducts,
          summary: {
            totalTransactions: totalCount,
            totalProducts: uniqueProducts.length,
            totalSpent,
            byStatus: statusCounts,
            lastPurchase: lastPurchaseDate,
          },
        },
        message: `Found ${totalCount} transactions with ${uniqueProducts.length} unique products`,
        statusCode: 200,
      };
    } catch (error) {
      this.logger.error(
        `❌ Error in optimized findByUser for ${idUser}: ${error.message}`,
      );
      return {
        success: false,
        message: `Error finding user data: ${error.message}`,
        statusCode: 500,
      };
    }
  }

  async findById(id: string): Promise<Product | null> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!product || !product.isActive) {
        this.logger.log(`❌ Product not found or inactive: ${id}`);
        return null;
      }

      this.logger.log(
        `✅ Product found: ${product.name} - Stock: ${product.stock} - Price: ${Number(product.price) / 100} pesos`,
      );
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
        select: { stock: true, isActive: true, name: true },
      });

      if (!product || !product.isActive) {
        this.logger.log(
          `❌ Product not found or inactive for stock check: ${id}`,
        );
        return false;
      }

      const hasStock = product.stock >= quantity;
      this.logger.log(
        `📊 Stock check: ${product.name} - Required: ${quantity}, Available: ${product.stock}, Has stock: ${hasStock}`,
      );

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
