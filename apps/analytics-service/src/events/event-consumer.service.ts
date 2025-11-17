import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Consumer, Message } from 'pulsar-client';
import { MetricsService } from '../analytics/metrics.service';
import { PulsarService } from './services/pulsar-consumer.service';
import {
  TaskCreatedEvent,
  TaskDeletedEvent,
  TaskEventTopic,
  TaskUpdatedEvent,
} from '@repo/pulsar/types';
import { EventType } from '../enums/event.type';

@Injectable()
export class EventConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventConsumerService.name);
  private consumers: Consumer[] = [];

  constructor(
    private readonly pulsarService: PulsarService,
    private readonly metricsService: MetricsService,
  ) {}

  async onModuleInit() {
    console.log('🎯 Initializing Analytics Event Consumers...');
    await this.subscribeToEvents();
  }

  async onModuleDestroy() {
    console.log('👋 Closing Analytics Event Consumers...');
    await Promise.all(this.consumers.map((consumer) => consumer.close()));
  }

  private async subscribeToEvents() {
    try {
      await this.pulsarService.subscribe(
        TaskEventTopic.TASK_CREATED,
        'analytics-service-created',
        this.handleTaskCreated.bind(this),
      );
      await this.pulsarService.subscribe(
        TaskEventTopic.TASK_UPDATED,
        'analytics-service-updated',
        this.handleTaskUpdated.bind(this),
      );
      await this.pulsarService.subscribe(
        TaskEventTopic.TASK_DELETED,
        'analytics-service-deleted',
        this.handleTaskDeleted.bind(this),
      );
      this.logger.log('✅ Analytics Event Consumers initialized');
    } catch (error) {
      this.logger.error('Failed to subscribe to task events', error);
      throw error;
    }
    //////////////////////////////////////////////////////////////////////////////////////////////
    // const completedConsumer = await this.pulsarService.createConsumer({
    //   topic: 'task-completed',
    //   subscription: 'analytics-service-completed',
    //   subscriptionType: 'Shared',
    // });
    // this.consumers.push(completedConsumer);
    // this.consumeTaskCompleted(completedConsumer);
  }

  private async handleTaskCreated(message: Message) {
    try {
      const data: TaskCreatedEvent = JSON.parse(message.getData().toString());
      this.logger.log(`📊 Processing task-created event: ${data.task.id}`);
      await this.metricsService.recordTaskEvent({
        taskId: data.task.id,
        userId: data.userId,
        eventType: EventType.CREATED,
        status: data.task.status,
        priority: data.task.priority,
        assignedTo: data.task.assignedToId,
        metadata: { title: data.task.title },
      });
    } catch (error) {
      this.logger.error(`Error processing task-created event: ${error}`);
      throw error;
    }
  }

  private async handleTaskUpdated(message: Message) {
    try {
      const data: TaskUpdatedEvent = JSON.parse(message.getData().toString());
      this.logger.log(`📊 Processing task-updated event: ${data.taskId}`);

      // Record status changes
      if (data.updatedFields.includes('status')) {
        await this.metricsService.recordTaskEvent({
          taskId: data.taskId,
          userId: data.userId,
          eventType: EventType.STATUS_CHANGED,
          status: data.changes.after.status,
          priority: data.changes.after.priority,
          assignedTo: data.changes.after.assignedTo,
          metadata: data.changes.after,
        });
      }

      // Record assignments
      if (
        data.changes.after.assignedTo &&
        data.changes.before.assignedTo !== data.changes.after.assignedTo
      ) {
        await this.metricsService.recordTaskEvent({
          taskId: data.taskId,
          userId: data.userId,
          eventType: EventType.ASSIGNED,
          assignedTo: data.changes.after.assignedTo,
          metadata: data.changes.after,
        });
      }

      // Record general updates
      await this.metricsService.recordTaskEvent({
        taskId: data.taskId,
        userId: data.userId,
        eventType: 'UPDATED',
        status: data.changes.after.status,
        priority: data.changes.after.priority,
        assignedTo: data.changes.after.assignedTo,
        metadata: data.changes.after,
      });
    } catch (error) {
      this.logger.error('Error processing task-updated event:', error);
      throw error;
    }
  }

  // private async consumeTaskCompleted(consumer: Consumer) {
  //   while (true) {
  //     try {
  //       const message: Message = await consumer.receive();
  //       const data: TaskCompletedEvent = JSON.parse(
  //         message.getData().toString(),
  //       );

  //       console.log(`📊 Processing task-completed event: ${data.taskId}`);

  //       await this.metricsService.recordTaskEvent({
  //         taskId: data.taskId,
  //         userId: data.userId,
  //         eventType: 'COMPLETED',
  //         status: 'COMPLETED',
  //         metadata: {
  //           completionTime: data.completionTime,
  //           completedAt: data.completedAt,
  //         },
  //       });

  //       await consumer.acknowledge(message);
  //     } catch (error) {
  //       console.error('Error processing task-completed event:', error);
  //     }
  //   }
  // }

  private async handleTaskDeleted(message: Message) {
    try {
      const data: TaskDeletedEvent = JSON.parse(message.getData().toString());
      this.logger.log(`📊 Processing task-deleted event: ${data.taskId}`);
      await this.metricsService.recordTaskEvent({
        taskId: data.taskId,
        userId: data.userId,
        eventType: EventType.DELETED,
        metadata: { deletedAt: data.timestamp },
      });
    } catch (error) {
      this.logger.error('Error processing task-deleted event:', error);
      throw error;
    }
  }
}
