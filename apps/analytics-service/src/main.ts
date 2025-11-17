import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { ProtoPackage } from '@repo/grpc/package';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const httpPort: number = app.get(ConfigService).getOrThrow('HTTP_PORT');
  const grpcPort: number = app.get(ConfigService).getOrThrow('GRPC_PORT');
  app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      package: ProtoPackage.ANALYTICS,
      protoPath: join(
        __dirname,
        '../../../node_modules/@repo/grpc/proto/analytics.proto',
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
  console.log(`🚀 Analytics http service is running on port ${httpPort}`);
  console.log(`🚀 Analytics grpc service is running on port ${grpcPort}`);
}

void bootstrap();
