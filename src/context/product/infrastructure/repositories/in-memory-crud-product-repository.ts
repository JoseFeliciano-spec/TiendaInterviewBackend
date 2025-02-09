import { HttpStatus, Injectable } from '@nestjs/common';
import { ProductMongo } from '@/context/product/infrastructure/schema/product.schema';
import { ProductRepository } from '@/context/product/domain/product.repository';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Product } from '../../domain/product.entity';
import { NotificationMongo } from '@/context/product/infrastructure/schema/notifier.schema';

@Injectable()
export class InMemoryCrudProductRepository extends ProductRepository {
  @InjectModel(ProductMongo.name)
  private productModel: Model<ProductMongo>;

  @InjectModel(NotificationMongo.name)
  private notificationModel: Model<NotificationMongo>;

  constructor(private jwtService: JwtService) {
    super();
  }

  async create(product: Product): Promise<any> {
    try {
      const productData = product.toPrimitives();

      const newProduct = new this.productModel({
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedProduct = await newProduct.save();

      return {
        message: 'Producto creado correctamente',
        statusCode: HttpStatus.CREATED,
        data: {
          id: savedProduct._id,
          name: savedProduct.name,
          sku: savedProduct.sku,
          price: savedProduct.price,
          stock: savedProduct.stock,
        },
      };
    } catch (error) {
      throw new Error('Error al crear el producto: ' + error.message);
    }
  }

  async deleteProduct(id: string): Promise<any> {
    try {
      const deletedProduct = await this.productModel.findByIdAndDelete(id);

      if (!deletedProduct) {
        return {
          message: 'Producto no encontrado',
          statusCode: HttpStatus.NOT_FOUND,
          data: null,
        };
      }

      return {
        message: 'Producto eliminado correctamente',
        statusCode: HttpStatus.OK,
        data: {
          id: deletedProduct._id,
        },
      };
    } catch (error) {
      throw new Error('Error al eliminar el producto: ' + error.message);
    }
  }

  async getAll(): Promise<any> {
    try {
      // Obtener todos los productos
      const products = await this.productModel.find().exec();

      // Filtrar productos con stock crítico (<= 5)
      const productsWithLowStock = products.filter(
        (product) => product.stock <= 5,
      );

      // Guardar en NotificationMongo si no existen notificaciones previas
      for (const product of productsWithLowStock) {
        const existingNotification = await this.notificationModel.findOne({
          productId: product._id,
        });

        if (!existingNotification) {
          await new this.notificationModel({
            productId: product._id,
            remainingQuantity: product.stock,
          }).save();
        }
      }

      return {
        message: productsWithLowStock.length
          ? `Atención: Hay productos con stock bajo (${productsWithLowStock
              .map((p) => `${p.name} (${p.stock} unidades)`)
              .join(', ')})`
          : 'Productos recuperados correctamente',
        statusCode: HttpStatus.OK,
        data: products.map((product) => ({
          id: product._id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          stock: product.stock,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        })),
      };
    } catch (error) {
      throw new Error('Error al obtener los productos: ' + error.message);
    }
  }

  async getProductById(id: string): Promise<any> {
    try {
      const product = await this.productModel.findById(id);

      if (!product) {
        return null;
      }

      return {
        id: product._id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        stock: product.stock,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };
    } catch (error) {
      throw new Error('Error al obtener el producto: ' + error.message);
    }
  }

  async update(product: Product): Promise<any> {
    try {
      const productData = product.toPrimitives();

      const updatedProduct = await this.productModel.findByIdAndUpdate(
        productData.id,
        {
          ...productData,
          updatedAt: new Date(),
        },
        { new: true },
      );

      if (!updatedProduct) {
        return {
          message: 'Producto no encontrado',
          statusCode: HttpStatus.NOT_FOUND,
          data: null,
        };
      }

      return {
        message: 'Producto actualizado correctamente',
        statusCode: HttpStatus.OK,
        data: {
          id: updatedProduct._id,
          name: updatedProduct.name,
          sku: updatedProduct.sku,
          price: updatedProduct.price,
          stock: updatedProduct.stock,
          updatedAt: updatedProduct.updatedAt,
        },
      };
    } catch (error) {
      throw new Error('Error al actualizar el producto: ' + error.message);
    }
  }

  async getById(id: string): Promise<any> {
    try {
      const product = await this.productModel.findById(id);

      if (!product) {
        return {
          message: 'Producto no encontrado',
          statusCode: HttpStatus.NOT_FOUND,
          data: null,
        };
      }

      return {
        message: 'Producto recuperado correctamente',
        statusCode: HttpStatus.OK,
        data: {
          id: product._id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          stock: product.stock,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
      };
    } catch (error) {
      throw new Error('Error al obtener el producto: ' + error.message);
    }
  }
}
