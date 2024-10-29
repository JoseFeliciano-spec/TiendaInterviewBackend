import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskMongo, TaskSchema } from './schema/task.schema';
import { TaskController } from './http-api/v1/crud-tasks.ts/crud-tasks.controller';
import { TaskUseCases } from '../application/crud-task-use-case/crud-taks.use-case';
import { InMemoryCrudTaskRepository } from './repositories/in-memory-crud-tasks-repository';
import { TaskRepository } from '../domain/task.repository';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: TaskMongo.name, schema: TaskSchema }]),
  ],
  controllers: [TaskController],
  providers: [
    TaskUseCases,
    InMemoryCrudTaskRepository,
    {
      provide: TaskRepository,
      useExisting: InMemoryCrudTaskRepository,
    },
  ],
  exports: [TaskUseCases],
})
export class TasksModules {}
