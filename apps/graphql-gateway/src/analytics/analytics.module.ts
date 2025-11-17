import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { AnalyticsResolver } from './analytics.resolver';
import { ProtoPackage } from '@repo/grpc/package';
import { AnalyticsService } from './analytics.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ClientsModule.registerAsync([
      {
        name: ProtoPackage.ANALYTICS,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: ProtoPackage.ANALYTICS,
            protoPath: join(
              __dirname,
              '../../../../node_modules/@repo/grpc/proto/analytics.proto',
            ),
            url:
              configService.get<string>('ANALYTICS_SERVICE_GRPC_URL') ||
              'localhost:5005',
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [AnalyticsResolver, AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
