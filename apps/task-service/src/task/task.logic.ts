import { Task } from '@repo/grpc/task';
import { Prisma } from '@prisma/client/task-service/index.js';
import { randomUUID } from 'crypto';
import {
  TaskCreatedEvent,
  TaskDeletedEvent,
  TaskEventType,
  TaskUpdatedEvent,
} from '@repo/pulsar/types';

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

  static mapCreateTaskEvent(
    task: Prisma.TaskGetPayload<any>,
    userId: string,
  ): TaskCreatedEvent {
    const event: TaskCreatedEvent = {
      eventId: randomUUID(),
      eventType: TaskEventType.TASK_CREATED,
      timestamp: new Date(),
      userId,
      task: {
        id: task.id,
        title: task.title,
        description: task.description || undefined,
        status: task.status,
        priority: task.priority,
        assignedToId: task.assignedTo || undefined,
        createdById: task.createdBy,
        dueDate: task.dueDate || undefined,
        createdAt: task.createdAt,
      },
    };
    return event;
  }

  static mapDeleteTaskEvent(
    task: Prisma.TaskGetPayload<any>,
    userId: string,
  ): TaskDeletedEvent {
    const event: TaskDeletedEvent = {
      eventId: randomUUID(),
      eventType: TaskEventType.TASK_DELETED,
      timestamp: new Date(),
      userId,
      taskId: task.id,
      task: {
        id: task.id,
        title: task.title,
        status: task.status,
      },
    };
    return event;
  }

  static mapUpdateTaskEvent(
    taskId: string,
    userId: string,
    before: Record<string, any>,
    after: Record<string, any>,
    updatedFields: string[],
  ): TaskUpdatedEvent {
    const event: TaskUpdatedEvent = {
      eventId: randomUUID(),
      eventType: TaskEventType.TASK_UPDATED,
      timestamp: new Date(),
      userId,
      taskId,
      changes: { before, after },
      updatedFields,
    };
    return event;
  }

  static mapTaskUpdateDetailsObject(
    task: Prisma.TaskGetPayload<any>,
  ): Record<string, any> {
    return {
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      assignedTo: task.assignedTo,
    };
  }
}
