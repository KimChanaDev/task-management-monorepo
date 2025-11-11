import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);
  const logger = new Logger('Main');

  const httpPort = configService.getOrThrow('HTTP_PORT');
  const nodeEnv = configService.getOrThrow('NODE_ENV');

  // Enable CORS
  app.enableCors({
    origin: [configService.get('CLIENT_URL') ?? '*'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(httpPort);

  logger.log(`🌍 Environment: ${nodeEnv}`);
  logger.log(`🚀 Notification Service is running on port ${httpPort}`);
  logger.log(`🔌 WebSocket available at: ws://localhost:${httpPort}`);
}

void bootstrap();
