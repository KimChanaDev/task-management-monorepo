import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { ProtoPackage } from '@repo/grpc/package';
import { GqlAuthGuard } from './guards/gql-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
      {
        name: ProtoPackage.AUTH,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: ProtoPackage.AUTH,
            protoPath: join(
              __dirname,
              '../../../../node_modules/@repo/grpc/proto/auth.proto',
            ),
            url: configService.getOrThrow('AUTH_SERVICE_GRPC_URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [AuthResolver, AuthService, GqlAuthGuard],
  exports: [AuthService],
})
export class AuthModule {}
