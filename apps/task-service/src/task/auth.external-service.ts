import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import {
  AUTH_SERVICE_NAME,
  AuthServiceClient,
  ValidateUserResponse,
} from '@repo/grpc/auth';
import {
  NotFoundRpcException,
  ServiceUnavailableRpcException,
} from '@repo/grpc/exception';
import { ProtoPackage } from '@repo/grpc/package';
import { firstValueFrom } from 'rxjs';

export class AuthExternalService implements OnModuleInit {
  private authService: AuthServiceClient;
  private readonly logger = new Logger(AuthExternalService.name);

  constructor(
    @Inject(ProtoPackage.AUTH) private readonly authClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authService =
      this.authClient.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  public async validateUserExists(userId: string): Promise<boolean> {
    let result: ValidateUserResponse;
    try {
      result = await firstValueFrom(this.authService.validateUser({ userId }));
    } catch (error) {
      this.logger.error(`Failed to validate user ${userId}:`, error.message);
      throw new ServiceUnavailableRpcException(`Auth Service unavailable`);
    }
    if (!result.valid) {
      throw new NotFoundRpcException(`User with ID ${userId} not found`);
    }
    return true;
  }
}
