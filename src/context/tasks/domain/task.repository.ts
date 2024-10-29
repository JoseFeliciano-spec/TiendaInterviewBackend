import {
  Task,
  PrimitiveTask,
  TaskStatus,
} from '@/context/tasks/domain/task.entity';

// Interfaz para el repositorio de tareas
export abstract class TaskRepository {
  // Métodos abstractos que deben implementarse en la clase concreta
  abstract create(task: Task): Promise<any>;
  abstract deleteTask(id: string): Promise<any>;
  abstract getAll(id: string): Promise<any>;
  abstract update(task: Task): Promise<any>;
  abstract getTaskById(id: string): Promise<any>;
}
