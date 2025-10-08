import { TaskStatus, TaskPriority } from '@prisma/client/task-service/index.js';
export interface TaskModel {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date | null;
  createdBy: string;
  assignedTo: string | null;
  createdAt: Date;
  updatedAt: Date;
}
