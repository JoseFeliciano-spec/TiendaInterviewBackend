export interface PrimitiveProduct {
  id?: string;
  name?: string;
  description?: string;
  price?: number; // En centavos
  originalPrice?: number;
  image?: string;
  category?: string;
  stock?: number;
  rating?: number;
  reviews?: number;
  tags?: string[];
  featured?: boolean;
  discount?: number;
  sku?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Product {
  constructor(private attributes: PrimitiveProduct) {}

  static fromPrimitives(primitives: PrimitiveProduct): Product {
    return new Product(primitives);
  }


  hasStock(quantity: number): boolean {
    return this.stock >= quantity;
  }

  toPrimitives(): PrimitiveProduct {
    return {
      id: this.attributes.id,
      name: this.attributes.name,
      description: this.attributes.description,
      price: this.attributes.price,
      originalPrice: this.attributes.originalPrice,
      image: this.attributes.image,
      category: this.attributes.category,
      stock: this.attributes.stock,
      rating: this.attributes.rating,
      reviews: this.attributes.reviews,
      tags: this.attributes.tags,
      featured: this.attributes.featured,
      discount: this.attributes.discount,
      sku: this.attributes.sku,
      isActive: this.attributes.isActive,
      createdAt: this.attributes.createdAt,
      updatedAt: this.attributes.updatedAt,
    };
  }

  // Getters
  get id(): string | undefined {
    return this.attributes.id;
  }

  get name(): string | undefined {
    return this.attributes.name;
  }

  get price(): number | undefined {
    return this.attributes.price;
  }

  get stock(): number | undefined {
    return this.attributes.stock;
  }

  get isActive(): boolean | undefined {
    return this.attributes.isActive;
  }
}
