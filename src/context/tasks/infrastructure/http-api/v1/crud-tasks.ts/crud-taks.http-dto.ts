import { IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '@/context/tasks/domain/task.entity';
import { IsMongoId } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({
    description: 'El título de la tarea',
    example: 'Hacer la compra',
    required: true,
  })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  title!: string;

  @ApiProperty({
    description: 'La descripción de la tarea',
    example: 'Comprar frutas y verduras para la semana',
    required: true,
  })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  description!: string;

  @ApiProperty({
    description: 'El estado de la tarea',
    example: 'pending',
    enum: ['pending', 'in-progress', 'completed'],
    required: true,
  })
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  @IsIn(['pending', 'in-progress', 'completed'], {
    message: 'El estado debe ser uno de: pending, in-progress, completed',
  })
  status!: TaskStatus;

  @ApiProperty({
    description: 'La fecha de vencimiento de la tarea (formato ISO 8601)',
    example: '2024-10-30T12:00:00Z',
    required: true,
  })
  dueDate: string;
}

export class UpdateTaskDto {
  @ApiProperty({
    description: 'El ID de la tarea que se desea actualizar',
    example: '605c72e1582d32001520b451',
    required: true,
  })
  @IsNotEmpty({ message: 'El ID de la tarea es obligatorio' })
  @IsMongoId({ message: 'El ID debe ser un BSON válido' })
  id!: string;

  @ApiProperty({
    description: 'El título de la tarea',
    example: 'Hacer la compra',
    required: true,
  })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  title!: string;

  @ApiProperty({
    description: 'La descripción de la tarea',
    example: 'Comprar frutas y verduras para la semana',
    required: true,
  })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  description!: string;

  @ApiProperty({
    description: 'El estado de la tarea',
    example: 'in-progress',
    enum: ['pending', 'in-progress', 'completed'],
    required: true,
  })
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  @IsIn(['pending', 'in-progress', 'completed'], {
    message: 'El estado debe ser uno de: pending, in-progress, completed',
  })
  status!: TaskStatus;

  @ApiProperty({
    description: 'La fecha de vencimiento de la tarea (formato ISO 8601)',
    example: '2024-10-30T12:00:00Z',
    required: false,
  })
  dueDate: string;
}

export class DeleteTaskDto {
  @ApiProperty({
    description: 'El ID de la tarea que se desea eliminar',
    example: '605c72e1582d32001520b451',
    required: true,
  })
  @IsNotEmpty({ message: 'El ID de la tarea es obligatorio' })
  @IsMongoId({ message: 'El ID debe ser un BSON válido' })
  id!: string;
}
