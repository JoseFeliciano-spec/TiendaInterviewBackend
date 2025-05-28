import { GetAllProductsUseCase } from '@/context/product/application/get-all-products-use-case/get-all-products.use-case';
import { AuthGuard } from '@/context/shared/guards/auth.guard';
import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';

@Controller('api/v1/products')
export class ProductController {
  constructor(private readonly getAllProductsUseCase: GetAllProductsUseCase) {}

  @Get()
  async getAllProducts(@Query() query: any) {
    const result = await this.getAllProductsUseCase.run({
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 10,
      category: query.category,
      featured: query.featured === 'true',
    });

    return { success: true, data: result, statusCode: 200 };
  }

  @Get('historial')
  @UseGuards(AuthGuard)
  async getProductUser(@Request() res: any): Promise<any> {
    const result = await this.getAllProductsUseCase.getProduct(res?.user?.sub);
    return result;
  }
}
