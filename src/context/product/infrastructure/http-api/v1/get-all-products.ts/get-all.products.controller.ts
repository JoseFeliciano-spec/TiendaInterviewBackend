import { GetAllProductsUseCase } from "@/context/product/application/get-all-products-use-case/get-all-products.use-case";
import { Controller, Get, Query } from "@nestjs/common";

@Controller('api/v1/products')
export class ProductController {
  constructor(
    private readonly getAllProductsUseCase: GetAllProductsUseCase,
  ) {}

  // ENDPOINT 1: Listar productos
  @Get()
  async getAllProducts(@Query() query: any) {
    const result = await this.getAllProductsUseCase.run({
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 10,
      category: query.category,
      featured: query.featured === 'true'
    });

    return { success: true, data: result, statusCode: 200 };
  }
}