import {
  IsNotEmpty,
  IsNumber,
  IsIn,
  IsMongoId,
  IsPositive,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStockMovementDto {
  @ApiProperty({
    description: 'ID del producto relacionado al movimiento',
    example: '507f1f77bcf86cd799439011',
    required: true,
  })
  @IsMongoId({ message: 'El ID del producto debe ser un MongoDB válido' })
  @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
  productId!: string;

  @ApiProperty({
    description: 'Tipo de movimiento de stock',
    example: 'entrada',
    enum: ['entrada', 'salida'],
    required: true,
  })
  @IsIn(['entrada', 'salida'], {
    message: 'El tipo debe ser "entrada" o "salida"',
  })
  @IsNotEmpty({ message: 'El tipo de movimiento es obligatorio' })
  type!: 'entrada' | 'salida';

  @ApiProperty({
    description: 'Cantidad del movimiento',
    example: 50,
    minimum: 1,
    required: true,
  })
  @IsPositive({ message: 'La cantidad debe ser mayor a 0' })
  @IsNumber({}, { message: 'La cantidad debe ser un número válido' })
  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  quantity!: number;
}

export class UpdateStockMovementDto {
  @ApiProperty({
    description: 'ID del movimiento a actualizar',
    example: '507f1f77bcf86cd799439013',
    required: true,
  })
  @IsMongoId({ message: 'El ID del movimiento debe ser un MongoDB válido' })
  @IsNotEmpty({ message: 'El ID del movimiento es obligatorio' })
  id!: string;

  @ApiProperty({
    description: 'ID del producto relacionado al movimiento',
    example: '507f1f77bcf86cd799439011',
    required: true,
  })
  @IsMongoId({ message: 'El ID del producto debe ser un MongoDB válido' })
  @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
  productId!: string;

  @ApiProperty({
    description: 'Tipo de movimiento de stock',
    example: 'salida',
    enum: ['entrada', 'salida'],
    required: true,
  })
  @IsIn(['entrada', 'salida'], {
    message: 'El tipo debe ser "entrada" o "salida"',
  })
  @IsNotEmpty({ message: 'El tipo de movimiento es obligatorio' })
  type!: 'entrada' | 'salida';

  @ApiProperty({
    description: 'Cantidad del movimiento',
    example: 30,
    minimum: 1,
    required: true,
  })
  @IsPositive({ message: 'La cantidad debe ser mayor a 0' })
  @IsNumber({}, { message: 'La cantidad debe ser un número válido' })
  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  quantity!: number;
}

export class DeleteStockMovementDto {
  @ApiProperty({
    description: 'ID del movimiento a eliminar',
    example: '507f1f77bcf86cd799439013',
    required: true,
  })
  @IsMongoId({ message: 'El ID del movimiento debe ser un MongoDB válido' })
  @IsNotEmpty({ message: 'El ID del movimiento es obligatorio' })
  id!: string;
}
