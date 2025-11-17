import { Module } from '@nestjs/common';
import { EventConsumerService } from './event-consumer.service';
import { AnalyticsModule } from '../analytics/analytics.module';
import { PulsarService } from './services/pulsar-consumer.service';

@Module({
  imports: [AnalyticsModule],
  providers: [EventConsumerService, PulsarService],
})
export class EventsModule {}
