import { randomUUID } from 'crypto';
import {
  TaskCreatedNotification,
  TaskDeletedNotification,
  NotificationType,
  Notification,
  TaskUpdatedNotification,
  TaskAssignedNotification,
} from '@repo/socket/types';
import {
  TaskCreatedEvent,
  TaskEvent,
  TaskEventType,
  TaskUpdatedEvent,
} from '@repo/pulsar/types';

export class NotificationLogic {
  static mapNewAssignedNotification(data: TaskUpdatedEvent) {
    const notification: TaskAssignedNotification = {
      id: randomUUID(),
      type: NotificationType.TASK_ASSIGNED,
      timestamp: new Date(),
      userId: data.userId,
      message: `Task "${data.changes.after.title ?? ''}" has been assigned to you`,
      read: false,
      data: {
        taskId: data.taskId,
        taskTitle: data.changes.after.title ?? '',
      },
    };
    return notification;
  }

  static mapNotificationMessage(data: TaskEvent): Notification {
    if (data.eventType === TaskEventType.TASK_CREATED) {
      const notification: TaskCreatedNotification = {
        id: randomUUID(),
        type: NotificationType.TASK_CREATED,
        timestamp: new Date(),
        userId: data.task.createdById,
        message: `New task "${data.task.title}" has been created`,
        read: false,
        data: {
          taskId: data.task.id,
          taskTitle: data.task.title,
          createdBy: data.task.createdById,
          assignedTo: data.task.assignedToId,
        },
      };
      return notification;
    }

    if (data.eventType === TaskEventType.TASK_UPDATED) {
      const changedFields = data.updatedFields.join(', ');
      let taskTitle = data.changes.before.title ?? 'Task';
      if (
        data.changes.before.title &&
        data.changes.after.title &&
        data.changes.before.title !== data.changes.after.title
      ) {
        taskTitle = ` (Title changed from "${data.changes.before.title}" to "${data.changes.after.title}")`;
      }
      const notification: TaskUpdatedNotification = {
        id: randomUUID(),
        type: NotificationType.TASK_UPDATED,
        timestamp: new Date(),
        userId: data.userId,
        message: `Task has been updated (${changedFields})`,
        read: false,
        data: {
          taskId: data.taskId,
          taskTitle: taskTitle,
          updatedBy: data.userId,
          updatedFields: data.updatedFields,
        },
      };
      return notification;
    }

    if (data.eventType === TaskEventType.TASK_DELETED) {
      const notification: TaskDeletedNotification = {
        id: randomUUID(),
        type: NotificationType.TASK_DELETED,
        timestamp: new Date(),
        userId: data.userId,
        message: `Task "${data.task.title}" has been deleted`,
        read: false,
        data: {
          taskId: data.taskId,
          taskTitle: data.task.title,
          deletedBy: data.userId,
        },
      };
      return notification;
    }

    throw new Error('TaskEventType not supported');
  }

  static mapAssigneeNotification(
    creatorNotification: TaskCreatedNotification,
    data: TaskCreatedEvent,
  ): TaskCreatedNotification {
    return {
      ...creatorNotification,
      id: randomUUID(),
      userId: data.task.assignedToId,
      message: `You have been assigned to task "${data.task.title}"`,
    } as TaskCreatedNotification;
  }
}
