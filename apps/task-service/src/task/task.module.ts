import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ProtoPackage } from '@repo/grpc/package';
import { ConfigService } from '@nestjs/config';
import { TaskRepository } from './task.repository';
import { AuthExternalService } from './external-services/auth.external-service';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    PrismaModule,
    EventsModule,
    ClientsModule.registerAsync([
      {
        name: ProtoPackage.AUTH,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: ProtoPackage.AUTH,
            protoPath: join(
              __dirname,
              '../../../../node_modules/@repo/grpc/proto/auth.proto',
            ),
            url: configService.getOrThrow('AUTH_SERVICE_GRPC_URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [TaskController],
  providers: [TaskService, TaskRepository, AuthExternalService],
  exports: [TaskService, TaskRepository, AuthExternalService],
})
export class TaskModule {}
