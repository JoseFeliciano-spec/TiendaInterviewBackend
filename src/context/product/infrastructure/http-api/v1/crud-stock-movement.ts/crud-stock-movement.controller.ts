import {
  Body,
  Controller,
  Post,
  Get,
  BadRequestException,
  UseGuards,
  Request,
  Delete,
  Param,
  Put,
} from '@nestjs/common';
import { StockMovementUseCases } from '@/context/product/application/crud-stock-movement-use-case/crud-stock-movement.use-case';
import { CreateStockMovementDto } from '@/context/product/infrastructure/http-api/v1/crud-stock-movement.ts/crud-stock-movement.http-dto';
import { errorResponse } from '@/context/shared/response/ErrorsResponse';
import { AuthGuard } from '@/context/shared/guards/auth.guard';

@Controller('v1/stock-movements')
@UseGuards(AuthGuard)
export class StockMovementController {
  constructor(private readonly stockMovementService: StockMovementUseCases) {}

  @Post()
  async register(
    @Request() req,
    @Body() stockMovementDto: CreateStockMovementDto,
  ) {
    await errorResponse(stockMovementDto, CreateStockMovementDto);
    try {
      const movementWithUser = {
        ...stockMovementDto,
      };
      return await this.stockMovementService.registerMovement(
        movementWithUser as any,
      );
    } catch (error) {
      throw new BadRequestException({
        errors: error.toString(),
        message: 'Error al registrar el movimiento de stock.',
      });
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.stockMovementService.getAllMovements();
    } catch (error) {
      throw new BadRequestException({
        errors: error.toString(),
        message: 'Error al obtener los movimientos.',
      });
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.stockMovementService.getMovementById(id);
    } catch (error) {
      throw new BadRequestException({
        errors: error.toString(),
        message: 'Error al obtener el movimiento.',
      });
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() stockMovementDto: CreateStockMovementDto,
  ) {
    await errorResponse(stockMovementDto, CreateStockMovementDto);
    try {
      return await this.stockMovementService.updateMovement({
        ...stockMovementDto,
        id,
      });
    } catch (error) {
      throw new BadRequestException({
        errors: error.toString(),
        message: 'Error al actualizar el movimiento.',
      });
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.stockMovementService.deleteMovement(id);
    } catch (error) {
      throw new BadRequestException({
        errors: error.toString(),
        message: 'Error al eliminar el movimiento.',
      });
    }
  }
}
