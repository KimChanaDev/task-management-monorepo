import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { FileService } from './file.service';
import { ProtoPackage } from '@repo/grpc/package';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ClientsModule.registerAsync([
      {
        name: ProtoPackage.FILE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: ProtoPackage.FILE,
            protoPath: join(
              __dirname,
              '../../../../node_modules/@repo/grpc/proto/file.proto',
            ),
            url: configService.getOrThrow<string>('FILE_SERVICE_GRPC_URL'),
            maxReceiveMessageLength: 50 * 1024 * 1024, // 50MB
            maxSendMessageLength: 50 * 1024 * 1024, // 50MB
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
