import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { TaskMongo } from '@/context/tasks/infrastructure/schema/task.schema';
import { TaskRepository } from '@/context/tasks/domain/task.repository';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Task } from '../../domain/task.entity';

@Injectable()
export class InMemoryCrudTaskRepository extends TaskRepository {
  @InjectModel(TaskMongo.name)
  private taskModel: Model<TaskMongo>;

  constructor(private jwtService: JwtService) {
    super();
  }

  async create(task: Task): Promise<any> {
    try {
      const taskData = task.toPrimitives();

      const newTask = new this.taskModel({
        ...taskData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedTask = await newTask.save();

      return {
        message: 'Tarea creada correctamente',
        statusCode: HttpStatus.CREATED,
        data: {
          id: savedTask._id,
          title: savedTask.title,
          description: savedTask.description,
          userId: savedTask.userId,
        },
      };
    } catch (error) {
      throw new Error('Error al crear la tarea: ' + error.message);
    }
  }

  async deleteTask(id: string): Promise<any> {
    try {
      const deletedTask = await this.taskModel.findByIdAndDelete(id);

      if (!deletedTask) {
        return {
          message: 'Tarea no encontrada',
          statusCode: HttpStatus.NOT_FOUND,
          data: null,
        };
      }

      return {
        message: 'Tarea eliminada correctamente',
        statusCode: HttpStatus.OK,
        data: {
          id: deletedTask._id,
        },
      };
    } catch (error) {
      throw new Error('Error al eliminar la tarea: ' + error.message);
    }
  }

  async getAll(): Promise<any> {
    try {
      const tasks = await this.taskModel.find().exec();

      return {
        message: 'Tareas recuperadas correctamente',
        statusCode: HttpStatus.OK,
        data: tasks.map((task) => ({
          id: task._id,
          title: task.title,
          description: task.description,
          userId: task.userId,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        })),
      };
    } catch (error) {
      throw new Error('Error al obtener las tareas: ' + error.message);
    }
  }

  async getTaskById(id: string): Promise<any> {
    try {
      const task = await this.taskModel.findById(id);

      if (!task) {
        return null;
      }

      return {
        id: task._id,
        title: task.title,
        description: task.description,
        userId: task.userId,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      };
    } catch (error) {
      throw new Error('Error al obtener la tarea: ' + error.message);
    }
  }

  async getAllByUserId(userId: string): Promise<any> {
    try {
      const tasks = await this.taskModel.find({ userId }).exec();

      return {
        message: 'Tareas del usuario recuperadas correctamente',
        statusCode: HttpStatus.OK,
        data: tasks.map((task) => ({
          id: task._id,
          title: task.title,
          description: task.description,
          userId: task.userId,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        })),
      };
    } catch (error) {
      throw new Error(
        'Error al obtener las tareas del usuario: ' + error.message,
      );
    }
  }

  async update(task: Task): Promise<any> {
    try {
      const taskData = task.toPrimitives();
      console.log(taskData);

      const updatedTask = await this.taskModel.findByIdAndUpdate(
        taskData.id,
        {
          ...taskData,
          updatedAt: new Date(),
        },
        { new: true },
      );

      if (!updatedTask) {
        return {
          message: 'Tarea no encontrada',
          statusCode: HttpStatus.NOT_FOUND,
          data: null,
        };
      }

      return {
        message: 'Tarea actualizada correctamente',
        statusCode: HttpStatus.OK,
        data: {
          id: updatedTask._id,
          title: updatedTask.title,
          description: updatedTask.description,
          userId: updatedTask.userId,
          updatedAt: updatedTask.updatedAt,
        },
      };
    } catch (error) {
      throw new Error('Error al actualizar la tarea: ' + error.message);
    }
  }

  async getById(id: string): Promise<any> {
    try {
      const task = await this.taskModel.findById(id);

      if (!task) {
        return {
          message: 'Tarea no encontrada',
          statusCode: HttpStatus.NOT_FOUND,
          data: null,
        };
      }

      return {
        message: 'Tarea recuperada correctamente',
        statusCode: HttpStatus.OK,
        data: {
          id: task._id,
          title: task.title,
          description: task.description,
          userId: task.userId,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        },
      };
    } catch (error) {
      throw new Error('Error al obtener la tarea: ' + error.message);
    }
  }
}
