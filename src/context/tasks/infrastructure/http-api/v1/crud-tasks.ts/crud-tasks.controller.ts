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

import { TaskUseCases } from '@/context/tasks/application/crud-task-use-case/crud-taks.use-case';
import {
  CreateTaskDto,
  DeleteTaskDto,
  UpdateTaskDto,
} from '@/context/tasks/infrastructure/http-api/v1/crud-tasks.ts/crud-taks.http-dto';
import { errorResponse } from '@/context/shared/response/ErrorsResponse';
import { AuthGuard } from '@/context/shared/guards/auth.guard';

@Controller('v1/tasks')
@UseGuards(AuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskUseCases) {}

  @Post()
  async create(@Request() req, @Body() createTaskDto: CreateTaskDto) {
    await errorResponse(createTaskDto, CreateTaskDto);
    try {
      // Agregamos el userId desde el token
      const taskWithUser = {
        ...createTaskDto,
        userId: req.user.sub, // Asumiendo que el ID del usuario está en el campo 'sub' del JWT
      };

      return await this.taskService.createTask(taskWithUser);
    } catch (error) {
      throw new BadRequestException({
        errors: error.toString(),
        message:
          'Hubo un error al crear la tarea. Por favor, inténtalo nuevamente.',
      });
    }
  }

  @Get()
  async findAll(@Request() req): Promise<any> {
    try {
      // Obtener solo las tareas del usuario autenticado
      return await this.taskService.getAllTasks(req.user.sub);
    } catch (error) {
      throw new BadRequestException({
        errors: error.toString(),
        message:
          'Hubo un error al obtener las tareas. Por favor, inténtalo nuevamente.',
      });
    }
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    try {
      const existingTask = await this.taskService.getTaskById(id);

      if (existingTask?.userId !== req.user.sub) {
        throw new BadRequestException({
          message: 'No tienes permiso para modificar esta tarea',
        });
      }
      return await this.taskService.updateTask({
        ...updateTaskDto,
        id: id,
        userId: req.user.sub,
      });
    } catch (error) {
      throw new BadRequestException({
        errors: error.toString(),
        message:
          'Hubo un error al actualizar la tarea. Por favor, inténtalo nuevamente.',
      });
    }
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    try {
      const existingTask = await this.taskService.getTaskById(id);

      if (existingTask?.userId !== req.user.sub) {
        throw new BadRequestException({
          message: 'No tienes permiso para modificar esta tarea',
        });
      }

      return await this.taskService.deleteTask(id);
    } catch (error) {
      throw new BadRequestException({
        errors: error.toString(),
        message:
          'Hubo un error al eliminar la tarea. Por favor, inténtalo nuevamente.',
      });
    }
  }
}
