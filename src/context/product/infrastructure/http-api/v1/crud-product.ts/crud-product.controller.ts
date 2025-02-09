import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  BadRequestException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProductUseCases } from '@/context/product/application/crud-product-use-case/crud-product.use-case';
import {
  CreateProductDto,
  UpdateProductDto,
} from '@/context/product/infrastructure/http-api/v1/crud-product.ts/crud-product.http-dto';
import { errorResponse } from '@/context/shared/response/ErrorsResponse';
import { AuthGuard } from '@/context/shared/guards/auth.guard';

@Controller('v1/products')
@UseGuards(AuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductUseCases) {}

  @Post()
  async create(@Request() req, @Body() createProductDto: CreateProductDto) {
    await errorResponse(createProductDto, CreateProductDto);
    try {
      // Agregamos el userId desde el token para tracking
      const productWithUser = {
        ...createProductDto,
        createdBy: req.user.sub, // Guardamos quién creó el producto
      };

      return await this.productService.createProduct(productWithUser);
    } catch (error) {
      throw new BadRequestException({
        errors: error.toString(),
        message:
          'Hubo un error al crear el producto. Por favor, inténtalo nuevamente.',
      });
    }
  }

  @Get()
  async findAll(@Request() req): Promise<any> {
    try {
      return await this.productService.getAllProducts(req.user.sub);
    } catch (error) {
      throw new BadRequestException({
        errors: error.toString(),
        message:
          'Hubo un error al obtener los productos. Por favor, inténtalo nuevamente.',
      });
    }
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    try {
      return await this.productService.updateProduct({
        ...updateProductDto,
        id: id,
      });
    } catch (error) {
      throw new BadRequestException({
        errors: error.toString(),
        message:
          'Hubo un error al actualizar el producto. Por favor, inténtalo nuevamente.',
      });
    }
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    try {
      return await this.productService.deleteProduct(id);
    } catch (error) {
      throw new BadRequestException({
        errors: error.toString(),
        message:
          'Hubo un error al eliminar el producto. Por favor, inténtalo nuevamente.',
      });
    }
  }
}
