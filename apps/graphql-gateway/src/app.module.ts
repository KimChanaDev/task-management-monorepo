import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';
import { GqlContext } from './interfaces/gql-context.interface';

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
  ],
})
export class AppModule {}
