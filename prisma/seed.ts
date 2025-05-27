import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const mockProducts = [
  {
    name: "iPhone 15 Pro Max 256GB",
    description: "El smartphone más avanzado con chip A17 Pro, cámara profesional de 48MP y pantalla Super Retina XDR",
    price: 499999900, // 4.999.999 pesos en centavos
    originalPrice: 549999900,
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    category: "smartphones",
    stock: 15,
    rating: 4.9,
    reviews: 324,
    tags: ["premium", "nuevo", "5g"],
    featured: true,
    discount: 9,
    sku: "IPH15PM256GB"
  },
  {
    name: "MacBook Pro 16 M3 Max",
    description: "Laptop profesional con chip M3 Max, pantalla Liquid Retina XDR de 16 pulgadas y hasta 22 horas de batería",
    price: 899999900,
    originalPrice: 999999900,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    category: "laptops",
    stock: 8,
    rating: 4.8,
    reviews: 156,
    tags: ["profesional", "m3", "retina"],
    featured: true,
    discount: 10,
    sku: "MBP16M3MAX"
  },
  {
    name: "AirPods Pro 3ra Generación",
    description: "Audífonos inalámbricos premium con cancelación activa de ruido adaptativo y audio espacial personalizado",
    price: 89999900,
    originalPrice: 109999900,
    image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    category: "audio",
    stock: 32,
    rating: 4.7,
    reviews: 892,
    tags: ["inalámbrico", "noise-cancelling", "spatial"],
    featured: false,
    discount: 18,
    sku: "APP3GEN"
  },
  {
    name: "iPad Air M2 Wi-Fi 256GB",
    description: "Tablet versátil con chip M2 de nueva generación, pantalla Liquid Retina de 10.9 pulgadas y Magic Keyboard",
    price: 249999900,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    category: "tablets",
    stock: 12,
    rating: 4.6,
    reviews: 234,
    tags: ["m2", "liquid-retina", "versatil"],
    featured: false,
    sku: "IPADAIRM2256"
  },
  {
    name: "Samsung Galaxy S24 Ultra 512GB",
    description: "Smartphone Galaxy con S Pen integrado, cámara AI de 200MP y pantalla Dynamic AMOLED 2X de 6.8 pulgadas",
    price: 429999900,
    originalPrice: 479999900,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    category: "smartphones",
    stock: 20,
    rating: 4.5,
    reviews: 445,
    tags: ["s-pen", "200mp", "amoled"],
    featured: true,
    discount: 10,
    sku: "SGS24U512"
  },
  {
    name: "Sony WH-1000XM5 Wireless",
    description: "Audífonos premium over-ear con la mejor cancelación de ruido del mercado y 30 horas de batería",
    price: 129999900,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    category: "audio",
    stock: 18,
    rating: 4.8,
    reviews: 567,
    tags: ["premium", "noise-cancelling", "sony"],
    featured: false,
    sku: "SONYWH1000XM5"
  },
  {
    name: "Dell XPS 13 Plus",
    description: "Ultrabook premium con Intel Core i7 de 12va generación, 16GB RAM y pantalla OLED 4K InfinityEdge",
    price: 359999900,
    originalPrice: 399999900,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    category: "laptops",
    stock: 6,
    rating: 4.4,
    reviews: 189,
    tags: ["ultrabook", "intel", "oled"],
    featured: true,
    discount: 10,
    sku: "DELLXPS13PLUS"
  },
  {
    name: "Nintendo Switch OLED",
    description: "Consola híbrida con pantalla OLED de 7 pulgadas, 64GB de almacenamiento interno y Joy-Con mejorados",
    price: 149999900,
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    category: "gaming",
    stock: 25,
    rating: 4.6,
    reviews: 678,
    tags: ["nintendo", "oled", "portatil"],
    featured: false,
    sku: "NSWITCHOLED"
  }
];

// Usuarios de prueba
const mockUsers = [
  {
    name: "Juan Pérez",
    email: "juan@test.com",
    password: "$2b$10$hashedPassword123" // En producción, hashear correctamente
  },
  {
    name: "María García",
    email: "maria@test.com", 
    password: "$2b$10$hashedPassword456"
  },
  {
    name: "Carlos Rodríguez",
    email: "carlos@test.com",
    password: "$2b$10$hashedPassword789"
  }
];

async function seedDatabase() {
  console.log('🚀 Iniciando seeding de la base de datos para el test de Tienda...');
  
  try {
    // Limpiar la base de datos en orden correcto (por las foreign keys)
    console.log('🗑️  Limpiando base de datos...');
    await prisma.stockMovement.deleteMany();
    await prisma.transactionItem.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.delivery.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('✅ Base de datos limpiada');

    // Crear usuarios de prueba
    console.log('👥 Creando usuarios de prueba...');
    const userResult = await prisma.user.createMany({
      data: mockUsers,
      skipDuplicates: true
    });
    console.log(`✅ ${userResult.count} usuarios creados`);

    // Crear productos usando createMany para eficiencia
    console.log('📦 Creando productos dummy...');
    const productResult = await prisma.product.createMany({
      data: mockProducts,
      skipDuplicates: true
    });
    console.log(`✅ ${productResult.count} productos creados`);

    // Crear algunos movimientos de stock iniciales
    console.log('📊 Creando movimientos de stock iniciales...');
    const products = await prisma.product.findMany();
    
    const stockMovements = products.map(product => ({
      productId: product.id,
      movementType: 'RESTOCK' as const,
      quantity: product.stock,
      previousStock: 0,
      newStock: product.stock,
      reason: 'Stock inicial',
      reference: `INITIAL_STOCK_${Date.now()}`
    }));

    await prisma.stockMovement.createMany({
      data: stockMovements
    });
    console.log(`✅ ${stockMovements.length} movimientos de stock creados`);

    // Verificación final
    const stats = {
      users: await prisma.user.count(),
      products: await prisma.product.count(),
      featuredProducts: await prisma.product.count({ where: { featured: true } }),
      inStockProducts: await prisma.product.count({ where: { stock: { gt: 0 } } }),
      stockMovements: await prisma.stockMovement.count()
    };

    console.log('\n📊 Estadísticas finales del seeding:');
    console.log(`   - Usuarios: ${stats.users}`);
    console.log(`   - Productos: ${stats.products}`);
    console.log(`   - Productos destacados: ${stats.featuredProducts}`);
    console.log(`   - Productos en stock: ${stats.inStockProducts}`);
    console.log(`   - Movimientos de stock: ${stats.stockMovements}`);
    
    console.log('\n🎉 ¡Seeding completado exitosamente para el test!');
    console.log('📱 Ready para el flujo de 5 pasos: Product page → Credit Card/Delivery → Summary → Final status → Product page');

  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el seeding
if (require.main === module) {
  seedDatabase()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

export { seedDatabase };
