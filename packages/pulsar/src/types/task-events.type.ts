export enum TaskEventType {
  TASK_CREATED = "task.created",
  TASK_UPDATED = "task.updated",
  TASK_DELETED = "task.deleted",
}

export enum TaskEventTopic {
  TASK_EVENTS = "persistent://public/default/task-events",
  TASK_CREATED = "persistent://public/default/task-created",
  TASK_UPDATED = "persistent://public/default/task-updated",
  TASK_DELETED = "persistent://public/default/task-deleted",
}

export type PulsarTopic = (typeof TaskEventTopic)[keyof typeof TaskEventTopic];

export interface BaseTaskEvent {
  eventId: string;
  eventType: TaskEventType;
  timestamp: Date;
  userId: string;
  assignedToId?: string;
}

export interface TaskCreatedEvent extends BaseTaskEvent {
  eventType: TaskEventType.TASK_CREATED;
  task: {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    assignedToId?: string;
    createdById: string;
    dueDate?: Date;
    createdAt: Date;
  };
}

export interface TaskUpdatedEvent extends BaseTaskEvent {
  eventType: TaskEventType.TASK_UPDATED;
  taskId: string;
  changes: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  updatedFields: string[];
}

export interface TaskDeletedEvent extends BaseTaskEvent {
  eventType: TaskEventType.TASK_DELETED;
  taskId: string;
  task: {
    id: string;
    title: string;
    status: string;
  };
}

export type TaskEvent = TaskCreatedEvent | TaskUpdatedEvent | TaskDeletedEvent;
