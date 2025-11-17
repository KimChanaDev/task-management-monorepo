import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';
import { GqlContext } from './interfaces/gql-context.interface';
import { TaskModule } from './task/task.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<YogaDriverConfig>({
      driver: YogaDriver,
      context: ({ req, res }: GqlContext) => ({ req, res }),
      autoSchemaFile: true,
      useGlobalPrefix: true,
      plugins: [],
    }),
    AuthModule,
    TaskModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
