export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface CrudTasKDto {
  title: string;
  description: string;
  status: TaskStatus;
  userId?: string;
  id?: string;
  dueDate?: string;
}
