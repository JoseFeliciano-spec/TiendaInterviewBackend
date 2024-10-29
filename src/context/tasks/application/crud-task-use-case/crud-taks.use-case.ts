import { Injectable } from '@nestjs/common';
import { Task, PrimitiveTask } from '@/context/tasks/domain/task.entity';
import { TaskRepository } from '@/context/tasks/domain/task.repository';
import { CrudTasKDto } from './crud-task.dto';

@Injectable()
export class TaskUseCases {
  constructor(private readonly taskRepository: TaskRepository) {}

  async createTask(
    dto: CrudTasKDto,
  ): Promise<{ data: PrimitiveTask; message: string; statusCode: number }> {
    const task = Task.create(dto as any);
    const savedTask = await this.taskRepository.create(task);

    return savedTask;
  }

  async updateTask(
    dto: CrudTasKDto,
  ): Promise<{ data: PrimitiveTask; message: string; statusCode: number }> {
    const task = Task.update(dto as any);
    const updateTaks = await this.taskRepository.update(task);
    return updateTaks;
  }

  async getAllTasks(id: string): Promise<{
    data: PrimitiveTask[];
    message: string;
    statusCode: number;
  }> {
    const tasks = await this.taskRepository.getAll(id); // Obtiene todas las tareas
    return tasks;
  }

  async getTaskById(id: string): Promise<any> {
    const task = await this.taskRepository.getTaskById(id);
    return task;
  }

  async deleteTask(
    id: string,
  ): Promise<{ message: string; statusCode: number }> {
    const taksDelete = await this.taskRepository.deleteTask(id); // Verifica si la tarea existe
    return taksDelete;
  }
}
