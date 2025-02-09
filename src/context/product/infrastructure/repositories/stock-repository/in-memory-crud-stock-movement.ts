import { HttpStatus, Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StockMovementRepository } from '@/context/product/domain/stock-movement/stock-movement.repository';
import { StockMovement } from '@/context/product/domain/stock-movement/stock-movement.entity';
import { StockMovementMongo } from '@/context/product/infrastructure/schema/stock.schema';
import { ProductMongo } from '@/context/product/infrastructure/schema/product.schema';

@Injectable()
export class InMemoryCrudStockMovementRepository extends StockMovementRepository {
  @InjectModel(StockMovementMongo.name)
  private stockMovementModel: Model<StockMovementMongo>;

  @InjectModel(ProductMongo.name)
  private productModel: Model<ProductMongo>;

  async registerMovement(dto: StockMovement): Promise<any> {
    try {
      const movementDto = dto.toPrimitives();

      // Validar existencia del producto
      const productModel = await this.productModel.findById(
        movementDto.productId,
      );
      if (!productModel) {
        return {
          message: 'Producto no encontrado',
          statusCode: HttpStatus.NOT_FOUND,
          data: null,
        };
      }

      const productDto = productModel;

      // Validar stock suficiente para salidas
      if (movementDto.type === 'salida') {
        if (productDto.stock < movementDto.quantity) {
          throw new BadRequestException(
            `Stock insuficiente. Stock actual: ${productDto.stock}, Cantidad solicitada: ${movementDto.quantity}`,
          );
        }
      }

      // Crear el movimiento
      const movement = new this.stockMovementModel({
        ...movementDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Actualizar el stock del producto
      const newStock =
        movementDto.type === 'entrada'
          ? productDto.stock + movementDto.quantity
          : productDto.stock - movementDto.quantity;

      await this.productModel.findByIdAndUpdate(
        movementDto.productId,
        {
          stock: newStock,
          updatedAt: new Date(),
        },
        { new: true },
      );

      const savedMovement = await movement.save();

      return {
        message: 'Movimiento registrado correctamente',
        statusCode: HttpStatus.CREATED,
        data: {
          id: savedMovement._id,
          productId: savedMovement.productId,
          type: savedMovement.type,
          quantity: savedMovement.quantity,
          createdAt: savedMovement.createdAt,
          updatedAt: savedMovement.updatedAt,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error('Error al registrar el movimiento: ' + error.message);
    }
  }

  async getAllMovements(): Promise<any> {
    try {
      const movements = await this.stockMovementModel
        .find()
        .populate('productId', 'name stock')
        .exec();

      return {
        message: 'Movimientos recuperados correctamente',
        statusCode: HttpStatus.OK,
        data: movements.map((movement) => ({
          id: movement._id,
          productId: movement.productId,
          type: movement.type,
          quantity: movement.quantity,
          createdAt: movement.createdAt,
          updatedAt: movement.updatedAt,
        })),
      };
    } catch (error) {
      throw new Error('Error al obtener los movimientos: ' + error.message);
    }
  }

  async getMovementById(id: string): Promise<any> {
    try {
      const movement = await this.stockMovementModel
        .findById(id)
        .populate('productId', 'name stock');

      if (!movement) {
        return {
          message: 'Movimiento no encontrado',
          statusCode: HttpStatus.NOT_FOUND,
          data: null,
        };
      }

      return {
        message: 'Movimiento recuperado correctamente',
        statusCode: HttpStatus.OK,
        data: {
          id: movement._id,
          productId: movement.productId,
          type: movement.type,
          quantity: movement.quantity,
          createdAt: movement.createdAt,
          updatedAt: movement.updatedAt,
        },
      };
    } catch (error) {
      throw new Error('Error al obtener el movimiento: ' + error.message);
    }
  }

  async deleteMovement(id: string): Promise<any> {
    try {
      const movementModel = await this.stockMovementModel.findById(id);
      if (!movementModel) {
        return {
          message: 'Movimiento no encontrado',
          statusCode: HttpStatus.NOT_FOUND,
          data: null,
        };
      }

      const movementDto = movementModel;

      // Revertir el cambio en el stock del producto
      const productModel = await this.productModel.findById(
        movementDto.productId,
      );
      if (productModel) {
        const productDto = productModel;
        const newStock =
          movementDto.type === 'entrada'
            ? productDto.stock - movementDto.quantity
            : productDto.stock + movementDto.quantity;

        await this.productModel.findByIdAndUpdate(movementDto.productId, {
          stock: newStock,
          updatedAt: new Date(),
        });
      }

      const deletedMovement =
        await this.stockMovementModel.findByIdAndDelete(id);

      return {
        message: 'Movimiento eliminado correctamente',
        statusCode: HttpStatus.OK,
        data: {
          id: deletedMovement._id,
        },
      };
    } catch (error) {
      throw new Error('Error al eliminar el movimiento: ' + error.message);
    }
  }

  async updateMovement(dto: StockMovement): Promise<any> {
    try {
      const movementDto = dto.toPrimitives();
      const oldMovementModel = await this.stockMovementModel.findById(
        movementDto.id,
      );

      if (!oldMovementModel) {
        return {
          message: 'Movimiento no encontrado',
          statusCode: HttpStatus.NOT_FOUND,
          data: null,
        };
      }

      const oldMovementDto = oldMovementModel;

      const productModel = await this.productModel.findById(
        movementDto.productId,
      );
      
      if (!productModel) {
        return {
          message: 'Producto no encontrado',
          statusCode: HttpStatus.NOT_FOUND,
          data: null,
        };
      }

      const productDto = productModel;

      // Revertir el movimiento anterior
      const stockAfterReversion =
        oldMovementDto.type === 'entrada'
          ? productDto.stock - oldMovementDto.quantity
          : productDto.stock + oldMovementDto.quantity;

      // Validar el nuevo movimiento si es salida
      if (
        movementDto.type === 'salida' &&
        stockAfterReversion < movementDto.quantity
      ) {
        throw new BadRequestException(
          `Stock insuficiente. Stock disponible: ${stockAfterReversion}, Cantidad solicitada: ${movementDto.quantity}`,
        );
      }

      // Aplicar el nuevo movimiento
      const finalStock =
        movementDto.type === 'entrada'
          ? stockAfterReversion + movementDto.quantity
          : stockAfterReversion - movementDto.quantity;

      await this.productModel.findByIdAndUpdate(movementDto.productId, {
        stock: finalStock,
        updatedAt: new Date(),
      });

      const updatedMovement = await this.stockMovementModel.findByIdAndUpdate(
        movementDto.id,
        {
          ...movementDto,
          updatedAt: new Date(),
        },
        { new: true },
      );

      return {
        message: 'Movimiento actualizado correctamente',
        statusCode: HttpStatus.OK,
        data: {
          id: updatedMovement._id,
          productId: updatedMovement.productId,
          type: updatedMovement.type,
          quantity: updatedMovement.quantity,
          updatedAt: updatedMovement.updatedAt,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error('Error al actualizar el movimiento: ' + error.message);
    }
  }
}
