import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Pulsar from 'pulsar-client';
import { TaskEvent } from '../types/task-events.type';
import { PulsarLogic } from './pulsar.logic';

@Injectable()
export class PulsarService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PulsarService.name);
  private client: Pulsar.Client;
  private producers: Map<string, Pulsar.Producer> = new Map();

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    try {
      const serviceUrl = this.configService.get<string>(
        'PULSAR_SERVICE_URL',
        'pulsar://localhost:6650',
      );
      this.logger.log(`Connecting to Pulsar at ${serviceUrl}...`);
      this.client = new Pulsar.Client({
        serviceUrl,
        operationTimeoutSeconds: 30,
      });
      this.logger.log('✅ Pulsar client connected successfully');
    } catch (error) {
      this.logger.error('❌ Failed to connect to Pulsar', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      for (const [topic, producer] of this.producers.entries()) {
        await producer.close(); // Close all producers
        this.logger.log(`Closed producer for topic: ${topic}`);
      }
      await this.client.close(); // Close client
      this.logger.log('Pulsar client closed');
    } catch (error) {
      this.logger.error('Error closing Pulsar connections', error);
    }
  }

  private async getProducer(topic: string): Promise<Pulsar.Producer> {
    if (this.producers.has(topic)) {
      return this.producers.get(topic)!;
    }
    const producer = await this.client.createProducer({
      topic,
      sendTimeoutMs: 30000,
      batchingEnabled: true,
      batchingMaxPublishDelayMs: 10,
    });
    this.producers.set(topic, producer);
    this.logger.log(`Created proudcer for topic: ${topic}`);
    return producer;
  }

  async publishTaskEvent(event: TaskEvent): Promise<void> {
    try {
      const topic: string = PulsarLogic.detemineTopicByEvent(event.eventType);
      const producer = await this.getProducer(topic);
      await producer.send({
        data: Buffer.from(JSON.stringify(event)),
        eventTimestamp: event.timestamp.getTime(),
        properties: {
          eventType: event.eventType,
          userId: event.userId,
          eventId: event.eventId,
        },
      });
      this.logger.log(`Published event ${event.eventType} to topic ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to publish event ${event.eventType}`, error);
      throw error;
    }
  }

  async publishMultipleTaskEvent(events: TaskEvent[]): Promise<void> {
    try {
      await Promise.all(events.map((event) => this.publishTaskEvent(event)));
      this.logger.log(`Published ${events.length} events in batch`);
    } catch (error) {
      this.logger.error('Failed to publish events in batch', error);
      throw error;
    }
  }
}
