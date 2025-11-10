import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PulsarService } from './services/pulsar.service';

@Module({
  imports: [ConfigModule],
  providers: [PulsarService],
  exports: [PulsarService],
})
export class EventsModule {}
