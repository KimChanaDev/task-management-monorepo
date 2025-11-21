import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('NotificationService');
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const configService = app.get(ConfigService);
  const httpPort = configService.getOrThrow('HTTP_PORT');
  const nodeEnv = configService.getOrThrow('NODE_ENV');
  const clientUrl = configService.get('CLIENT_URL');

  // Enable CORS
  app.enableCors({
    origin: (origin, callback) => {
      // Allow all origins when CLIENT_URL is not set
      if (!clientUrl) {
        callback(null, true);
        return;
      }
      // Allow specific origins when CLIENT_URL is set
      const allowedOrigins = [clientUrl];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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
