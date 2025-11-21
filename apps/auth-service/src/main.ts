import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ProtoPackage } from '@repo/grpc/package';

async function bootstrap() {
  const logger = new Logger('AuthService');
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const httpPort: number = app.get(ConfigService).getOrThrow('HTTP_PORT');
  const grpcPort: number = app.get(ConfigService).getOrThrow('GRPC_PORT');
  app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      package: ProtoPackage.AUTH,
      protoPath: join(
        __dirname,
        '../../../node_modules/@repo/grpc/proto/auth.proto',
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
  logger.log(`🚀 Auth http service is running on port ${httpPort}`);
  logger.log(`🚀 Auth grpc service is running on port ${grpcPort}`);
}
void bootstrap();
