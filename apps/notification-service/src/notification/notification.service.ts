import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PulsarConsumerService } from '../pulsar/pulsar-consumer.service';
import { NotificationGateway } from '../websocket/notification.gateway';
import { TaskCreatedNotification } from '@repo/socket/types';
import {
  TaskCreatedEvent,
  TaskDeletedEvent,
  TaskUpdatedEvent,
  TaskEventTopic,
} from '@repo/pulsar/types';
import { NotificationLogic } from './notification.logic';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly pulsarConsumer: PulsarConsumerService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async onModuleInit() {
    await this.subscribeToTaskEvents();
  }

  private async subscribeToTaskEvents() {
    try {
      await this.pulsarConsumer.subscribe(
        TaskEventTopic.TASK_CREATED,
        'notification-service-task-created',
        this.handleTaskCreatedEvent.bind(this),
      );
      await this.pulsarConsumer.subscribe(
        TaskEventTopic.TASK_UPDATED,
        'notification-service-task-updated',
        this.handleTaskUpdatedEvent.bind(this),
      );
      await this.pulsarConsumer.subscribe(
        TaskEventTopic.TASK_DELETED,
        'notification-service-task-deleted',
        this.handleTaskDeletedEvent.bind(this),
      );
      this.logger.log('✅ Successfully subscribed to all task events');
    } catch (error) {
      this.logger.error('Failed to subscribe to task events', error);
      throw error;
    }
  }

  private handleTaskCreatedEvent(message: any) {
    try {
      const data: TaskCreatedEvent = JSON.parse(message.getData().toString());
      this.logger.log(`Received TaskCreated event: ${data.task.id}`);
      const notification = NotificationLogic.mapNotificationMessage(data);
      this.notificationGateway.sendNotificationToUser(
        data.task.createdById,
        notification,
      );

      // Send to assignee if different from creator
      if (
        data.task.assignedToId &&
        data.task.assignedToId !== data.task.createdById
      ) {
        const assigneeNotification = NotificationLogic.mapAssigneeNotification(
          notification as TaskCreatedNotification,
          data,
        );
        this.notificationGateway.sendNotificationToUser(
          data.task.assignedToId,
          assigneeNotification,
        );
      }
    } catch (error) {
      this.logger.error('Error handling TaskCreated event', error);
      throw error;
    }
  }

  private handleTaskUpdatedEvent(message: any) {
    try {
      const data: TaskUpdatedEvent = JSON.parse(message.getData().toString());
      this.logger.log(`Received TaskUpdated event: ${data.taskId}`);
      const notification = NotificationLogic.mapNotificationMessage(data);
      this.notificationGateway.sendNotificationToUser(
        data.userId,
        notification,
      );

      if (!data.changes.before.assignedTo && data.changes.after.assignedTo) {
        const newAssigneeNotification =
          NotificationLogic.mapNewAssignedNotification(data);
        this.notificationGateway.sendNotificationToUser(
          data.changes.after.assignedTo,
          newAssigneeNotification,
        );
      } else if (
        data.changes.before.assignedTo &&
        !data.changes.after.assignedTo
      ) {
        this.notificationGateway.sendNotificationToUser(
          data.changes.before.assignedTo,
          notification,
        );
      } else if (data.assignedToId) {
        this.notificationGateway.sendNotificationToUser(
          data.assignedToId,
          notification,
        );
      }
    } catch (error) {
      this.logger.error('Error handling TaskUpdated event', error);
      throw error;
    }
  }

  private handleTaskDeletedEvent(message: any) {
    try {
      const data: TaskDeletedEvent = JSON.parse(message.getData().toString());
      this.logger.log(`Received TaskDeleted event: ${data.taskId}`);
      this.notificationGateway.sendNotificationToUser(
        data.userId,
        NotificationLogic.mapNotificationMessage(data),
      );
      if (data.assignedToId) {
        this.notificationGateway.sendNotificationToUser(
          data.assignedToId,
          NotificationLogic.mapNotificationMessage(data),
        );
      }
    } catch (error) {
      this.logger.error('Error handling TaskDeleted event', error);
      throw error;
    }
  }

  /**
   * Get notification stats
   */
  getStats() {
    return {
      connectedUsers: this.notificationGateway.getConnectedUsersCount(),
      timestamp: new Date(),
    };
  }
}
