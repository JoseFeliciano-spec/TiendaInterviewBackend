import { IsNotEmpty, IsIn, IsDate } from 'class-validator';
import { TaskStatus } from '@/context/tasks/domain/task.entity';
import { IsMongoId } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty({ message: 'El título es obligatorio' })
  title!: string;

  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  description!: string;

  @IsNotEmpty({ message: 'El estado es obligatorio' })
  @IsIn(['pending', 'in-progress', 'completed'], {
    message: 'El estado debe ser uno de: pending, in-progress, completed',
  })
  status!: TaskStatus;
}

export class UpdateTaskDto {
  @IsNotEmpty({ message: 'El ID de la tarea es obligatorio' })
  @IsMongoId({ message: 'El ID debe ser un BSON válido' })
  id!: string;

  @IsNotEmpty({ message: 'El título es obligatorio' })
  title!: string;

  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  description!: string;

  @IsNotEmpty({ message: 'El estado es obligatorio' })
  @IsIn(['pending', 'in-progress', 'completed'], {
    message: 'El estado debe ser uno de: pending, in-progress, completed',
  })
  status!: TaskStatus;
}

export class DeleteTaskDto {
  @IsNotEmpty({ message: 'El ID de la tarea es obligatorio' })
  @IsMongoId({ message: 'El ID debe ser un BSON válido' })
  id!: string;
}
