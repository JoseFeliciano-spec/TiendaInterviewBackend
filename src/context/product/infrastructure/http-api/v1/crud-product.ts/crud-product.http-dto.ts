import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'El nombre del producto',
    example: 'Laptop Dell XPS 13',
    required: true,
  })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name!: string;

  @ApiProperty({
    description: 'El código SKU único del producto',
    example: 'DELL-XPS13-2024',
    required: true,
  })
  @IsNotEmpty({ message: 'El SKU es obligatorio' })
  sku!: string;

  @ApiProperty({
    description: 'El precio del producto',
    example: 1299.99,
    required: true,
  })
  @IsNotEmpty({ message: 'El precio es obligatorio' })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  price!: number;

  @ApiProperty({
    description: 'La cantidad disponible en inventario',
    example: 50,
    required: true,
  })
  @IsNotEmpty({ message: 'El stock es obligatorio' })
  @IsNumber({}, { message: 'El stock debe ser un número' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock!: number;
}

export class UpdateProductDto {
  @ApiProperty({
    description: 'El ID del producto que se desea actualizar',
    example: '605c72e1582d32001520b451',
    required: true,
  })
  @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
  @IsMongoId({ message: 'El ID debe ser un BSON válido' })
  id!: string;

  @ApiProperty({
    description: 'El nombre del producto',
    example: 'Laptop Dell XPS 13',
    required: true,
  })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name!: string;

  @ApiProperty({
    description: 'El código SKU único del producto',
    example: 'DELL-XPS13-2024',
    required: true,
  })
  @IsNotEmpty({ message: 'El SKU es obligatorio' })
  sku!: string;

  @ApiProperty({
    description: 'El precio del producto',
    example: 1299.99,
    required: true,
  })
  @IsNotEmpty({ message: 'El precio es obligatorio' })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  price!: number;

  @ApiProperty({
    description: 'La cantidad disponible en inventario',
    example: 50,
    required: true,
  })
  @IsNotEmpty({ message: 'El stock es obligatorio' })
  @IsNumber({}, { message: 'El stock debe ser un número' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock!: number;
}

export class DeleteProductDto {
  @ApiProperty({
    description: 'El ID del producto que se desea eliminar',
    example: '605c72e1582d32001520b451',
    required: true,
  })
  @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
  @IsMongoId({ message: 'El ID debe ser un BSON válido' })
  id!: string;
}
