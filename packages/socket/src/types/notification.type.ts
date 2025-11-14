export enum NotificationType {
  TASK_CREATED = "task.created",
  TASK_UPDATED = "task.updated",
  TASK_DELETED = "task.deleted",
  TASK_ASSIGNED = "task.assigned",
}

export interface BaseNotification {
  id: string;
  type: NotificationType;
  timestamp: Date;
  userId: string;
  message: string;
  read: boolean;
}

export interface TaskCreatedNotification extends BaseNotification {
  type: NotificationType.TASK_CREATED;
  data: {
    taskId: string;
    taskTitle: string;
    createdBy: string;
    assignedTo?: string;
  };
}

export interface TaskUpdatedNotification extends BaseNotification {
  type: NotificationType.TASK_UPDATED;
  data: {
    taskId: string;
    taskTitle: string;
    updatedBy: string;
    updatedFields: string[];
  };
}

export interface TaskDeletedNotification extends BaseNotification {
  type: NotificationType.TASK_DELETED;
  data: {
    taskId: string;
    taskTitle: string;
    deletedBy: string;
  };
}

export interface TaskAssignedNotification extends BaseNotification {
  type: NotificationType.TASK_ASSIGNED;
  data: {
    taskId: string;
    taskTitle: string;
  };
}

export type Notification =
  | TaskCreatedNotification
  | TaskUpdatedNotification
  | TaskDeletedNotification
  | TaskAssignedNotification;
