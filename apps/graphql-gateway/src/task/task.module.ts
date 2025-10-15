import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { TaskResolver } from './task.resolver';
import { TaskService } from './task.service';
import { ProtoPackage } from '@repo/grpc/package';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ClientsModule.registerAsync([
      {
        name: ProtoPackage.TASK,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: ProtoPackage.TASK,
            protoPath: join(
              __dirname,
              '../../../../node_modules/@repo/grpc/proto/task.proto',
            ),
            url: configService.getOrThrow<string>('TASK_SERVICE_GRPC_URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [TaskResolver, TaskService],
})
export class TaskModule {}
