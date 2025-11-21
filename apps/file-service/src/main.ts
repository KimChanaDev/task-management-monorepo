import { NestFactory } from '@nestjs/core';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { join } from 'path';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ProtoPackage } from '@repo/grpc/package';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('FileService');
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const httpPort: number = app.get(ConfigService).getOrThrow('HTTP_PORT');
  const grpcPort: number = app.get(ConfigService).getOrThrow('GRPC_PORT');
  app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      package: ProtoPackage.FILE,
      protoPath: join(
        __dirname,
        '../../../node_modules/@repo/grpc/proto/file.proto',
      ),
      url: `0.0.0.0:${grpcPort}`,
    },
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.startAllMicroservices();
  await app.listen(httpPort);
  logger.log(`🚀 File Service (HTTP) is running on port ${httpPort}`);
  logger.log(`🚀 File Service (gRPC) is running on port ${grpcPort}`);
}

void bootstrap();
