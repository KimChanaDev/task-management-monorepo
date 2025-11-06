import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GraphQLExceptionFilter } from './auth/filters/graphql-exception.filter';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const httpPort: number = app.get(ConfigService).getOrThrow('HTTP_PORT');
  const clientUrl: string | undefined = app
    .get(ConfigService)
    .get('CLIENT_URL');

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
    origin: [clientUrl ?? '*'],
    credentials: true,
    methods: ['GET', 'POST'],
    // allowedHeaders: ['Content-Type', 'Accept'],
  });

  await app.listen(httpPort);

  console.log(
    `🚀 GraphQL Gateway is running on http://localhost:${httpPort}/graphql`,
  );
}

void bootstrap();
