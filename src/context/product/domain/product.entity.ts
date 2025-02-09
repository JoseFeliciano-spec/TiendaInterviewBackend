
// Interfaz para los datos primitivos de un producto
export interface PrimitiveProduct {
  id?: string;
  name?: string;
  sku?: string;
  price?: number;
  stock?: number;
}

export class Product {
  constructor(private attributes: PrimitiveProduct) {}

  static create(createProduct: {
    name: string;
    sku: string;
    price: number;
    stock: number;
  }): Product {
    return new Product({
      name: createProduct.name,
      sku: createProduct.sku,
      price: createProduct.price,
      stock: createProduct.stock,
    });
  }

  static update(updateProduct: {
    id?: string;
    name?: string;
    sku?: string;
    price?: number;
    stock?: number;
  }): Product {
    return new Product({
      id: updateProduct.id,
      name: updateProduct.name,
      sku: updateProduct.sku,
      price: updateProduct.price,
      stock: updateProduct.stock,
    });
  }

  static delete(id: string): any {
    return new Product({});
  }

  static getAll(): Product[] {
    return [];
  }

  static async getProductById(id: string): Promise<any> {
    return null;
  }

  toPrimitives(): PrimitiveProduct {
    return {
      id: this.attributes.id,
      name: this.attributes.name,
      sku: this.attributes.sku,
      price: this.attributes.price,
      stock: this.attributes.stock,
    };
  }
}