export type TaskStatus = 'pending' | 'in-progress' | 'completed';

// Interfaz para los datos primitivos de una tarea
export interface PrimitiveTask {
  id?: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  userId?: string;
  dueDate?: string;
}

export class Task {
  constructor(private attributes: PrimitiveTask) {}

  static create(createTask: {
    title: string;
    description: string;
    status: TaskStatus;
    userId: string;
    dueDate: string;
  }): Task {
    return new Task({
      title: createTask.title,
      description: createTask.description,
      status: createTask.status,
      userId: createTask.userId,
      dueDate: createTask.dueDate,
    });
  }

  static update(createTask: {
    title?: string;
    description?: string;
    status?: TaskStatus;
    dueDate?: string;
    userId?: string;
    id?: string;
  }): Task {
    return new Task({
      title: createTask.title,
      description: createTask.description,
      status: createTask.status,
      userId: createTask.userId,
      id: createTask?.id,
      dueDate: createTask.dueDate,
    });
  }

  static delete(id: string): any {
    return new Task({});
  }

  static getAll(): Task[] {
    return [];
  }

  static getTaskById(id: string): Promise<any> {
    return null;
  }

  toPrimitives(): PrimitiveTask {
    return {
      id: this.attributes.id,
      title: this.attributes.title,
      description: this.attributes.description,
      status: this.attributes.status,
      userId: this.attributes.userId,
      dueDate: this.attributes.dueDate,
    };
  }
}
