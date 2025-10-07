import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const httpPort: number = app.get(ConfigService).get('HTTP_PORT') || 50051;
  const grpcPort: number = app.get(ConfigService).get('GRPC_PORT') || 50051;
  app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'auth',
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
  console.log(`🚀 Auth http service is running on port ${httpPort}`);
  console.log(`🚀 Auth grpc service is running on port ${grpcPort}`);
}
void bootstrap();
