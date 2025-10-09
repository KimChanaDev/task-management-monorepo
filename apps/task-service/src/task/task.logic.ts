import { Task } from '@repo/grpc/task';
import { Prisma } from '@prisma/client/task-service/index.js';

export class TaskLogic {
  static formatTask(task: Prisma.TaskGetPayload<any>): Task {
    return {
      id: task.id,
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.toISOString() : '',
      createdBy: task.createdBy,
      assignedTo: task.assignedTo || '',
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    } as Task;
  }
}
