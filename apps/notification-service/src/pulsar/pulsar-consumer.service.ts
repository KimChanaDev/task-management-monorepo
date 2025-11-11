import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Pulsar from 'pulsar-client';

@Injectable()
export class PulsarConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PulsarConsumerService.name);
  private client: Pulsar.Client;
  private consumers: Pulsar.Consumer[] = [];

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
      this.logger.log('✅ Pulsar consumer client connected successfully');
    } catch (error) {
      this.logger.error('❌ Failed to connect to Pulsar', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      for (const consumer of this.consumers) {
        await consumer.close(); // Close all consumers
      }
      this.logger.log('Closed all Pulsar consumers');
      await this.client.close(); // Close client
      this.logger.log('Pulsar client closed');
    } catch (error) {
      this.logger.error('Error closing Pulsar connections', error);
    }
  }

  /**
   * Subscribe to a topic and handle messages
   */
  async subscribe(
    topic: string,
    subscription: string,
    messageHandler: (message: Pulsar.Message) => Promise<void>,
  ): Promise<void> {
    try {
      this.logger.log(
        `Subscribing to topic: ${topic} with subscription: ${subscription}`,
      );
      const consumer = await this.client.subscribe({
        topic,
        subscription,
        subscriptionType: 'Shared',
        subscriptionInitialPosition: 'Latest',
      });
      this.consumers.push(consumer);
      void this.consumeMessages(consumer, messageHandler); // Start consuming messages
      this.logger.log(`✅ Successfully subscribed to ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to subscribe to topic ${topic}`, error);
      throw error;
    }
  }

  /**
   * Consume messages from a consumer
   */
  private async consumeMessages(
    consumer: Pulsar.Consumer,
    messageHandler: (message: Pulsar.Message) => Promise<void>,
  ): Promise<void> {
    while (true) {
      try {
        const message = await consumer.receive();
        try {
          await messageHandler(message); // Process message
          await consumer.acknowledge(message); // Acknowledge message
        } catch (error) {
          this.logger.error('Error processing message', error);
          consumer.negativeAcknowledge(message); // Negative acknowledge (will be redelivered)
        }
      } catch (error) {
        this.logger.error('Error receiving message', error);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait a bit before retrying
      }
    }
  }
}
