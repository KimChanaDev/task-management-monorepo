import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GraphQLExceptionFilter } from './auth/filters/graphql-exception.filter';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const logger = new Logger('GraphQLGateway');
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const httpPort: number = app.get(ConfigService).getOrThrow('HTTP_PORT');
  const clientUrl: string | undefined = app
    .get(ConfigService)
    .get('CLIENT_URL');

  // Increase body size limit for file uploads (nestjs default limit is 100KB to 1MB)
  // base64 encoded files are ~33% larger than the original file size
  // 50MB limit to accommodate 10MB files after base64 encoding + JSON overhead
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.use(cookieParser());
  app.useGlobalFilters(new GraphQLExceptionFilter());
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
    methods: ['GET', 'POST'],
    // allowedHeaders: ['Content-Type', 'Accept'],
  });

  await app.listen(httpPort);

  logger.log(
    `🚀 GraphQL Gateway is running on http://localhost:${httpPort}/graphql`,
  );
}

void bootstrap();
