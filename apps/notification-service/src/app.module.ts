import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PulsarConsumerService } from './pulsar/pulsar-consumer.service';
import { NotificationGateway } from './websocket/notification.gateway';
import { NotificationService } from './notification/notification.service';
import { RedisUserSocketService } from './redis/redis-user-socket.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    RedisUserSocketService,
    PulsarConsumerService,
    NotificationGateway,
    NotificationService,
  ],
})
export class AppModule {}
