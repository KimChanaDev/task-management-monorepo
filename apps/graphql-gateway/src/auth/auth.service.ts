import {
  Injectable,
  Inject,
  OnModuleInit,
  NotFoundException,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import {
  AuthServiceClient,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  ValidateTokenRequest,
  ValidateTokenResponse,
  ValidateUserRequest,
  ValidateUserResponse,
} from '@repo/grpc/auth';
import { ProtoPackage } from '@repo/grpc/package';
import { firstValueFrom } from 'rxjs';
import { MessageDto, UserDto } from './dto/user.dto';
import { GrpcCall } from 'src/utilities/grpc-call.handler';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Utility } from '@repo/common/utility';
import { ClientMetadata } from '@repo/common/interfaces';

@Injectable()
export class AuthService implements OnModuleInit {
  private authExternalService: AuthServiceClient;

  constructor(
    @Inject(ProtoPackage.AUTH) private client: ClientGrpc,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.authExternalService =
      this.client.getService<AuthServiceClient>('AuthService');
  }

  public async register(
    email: string,
    password: string,
    username: string,
  ): Promise<UserDto> {
    const request: RegisterRequest = {
      email,
      password,
      username,
    };
    const result: RegisterResponse = await GrpcCall.callByHandlerException(
      () => {
        return firstValueFrom(this.authExternalService.register(request));
      },
    );
    return result.user as UserDto;
  }

  private setCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const isSecureEnv = this.configService.get('AUTH_SECURE_COOKIES');
    const secure: boolean =
      isSecureEnv &&
      typeof isSecureEnv === 'string' &&
      isSecureEnv.toLowerCase() === 'false'
        ? false
        : !!isSecureEnv;

    const accessTokenExpiresIn = this.configService.getOrThrow(
      'ACCESS_TOKEN_EXPIRES_IN',
    );
    const refreshTokenExpiresIn = this.configService.getOrThrow(
      'REFRESH_TOKEN_EXPIRES_IN',
    );

    response.cookie('AccessToken', accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'strict',
      maxAge: Utility.parseExpiresIn(accessTokenExpiresIn),
    });
    response.cookie('RefreshToken', refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'strict',
      maxAge: Utility.parseExpiresIn(refreshTokenExpiresIn),
    });
  }

  public async login(
    email: string,
    password: string,
    response: Response,
    metadata: ClientMetadata,
  ): Promise<UserDto> {
    const request: LoginRequest = {
      email,
      password,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      deviceId: metadata.deviceId,
      deviceName: metadata.deviceName,
    };
    const result: LoginResponse = await GrpcCall.callByHandlerException(() => {
      return firstValueFrom(this.authExternalService.login(request));
    });
    this.setCookies(response, result.accessToken, result.refreshToken);
    return { ...result.user } as UserDto;
  }

  public async logout(
    userId: string,
    refreshToken: string,
    response: Response,
  ) {
    const request: LogoutRequest = { userId, refreshToken };
    const result: LogoutResponse = await GrpcCall.callByHandlerException(() => {
      return firstValueFrom(this.authExternalService.logout(request));
    });
    response.clearCookie('AccessToken');
    response.clearCookie('RefreshToken');
    return result as MessageDto;
  }

  public async validateToken(token: string): Promise<ValidateTokenResponse> {
    const request: ValidateTokenRequest = { token };
    const result: ValidateTokenResponse = await GrpcCall.callByHandlerException(
      () => {
        return firstValueFrom(this.authExternalService.validateToken(request));
      },
    );
    return result;
  }

  public async refreshAccessToken(
    refreshToken: string,
    response: Response,
    metadata: ClientMetadata,
  ) {
    const request: RefreshTokenRequest = {
      refreshToken,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      deviceId: metadata.deviceId,
      deviceName: metadata.deviceName,
    };
    const result: RefreshTokenResponse = await GrpcCall.callByHandlerException(
      () => {
        return firstValueFrom(this.authExternalService.refreshToken(request));
      },
    );
    this.setCookies(response, result.accessToken, result.refreshToken);
    return { message: 'Token refreshed successfully' } as MessageDto;
  }

  public async getUser(userId: string): Promise<ValidateUserResponse> {
    const request: ValidateUserRequest = { userId };
    const result: ValidateUserResponse = await GrpcCall.callByHandlerException(
      () => {
        return firstValueFrom(this.authExternalService.validateUser(request));
      },
    );
    if (!result.valid || !result.user) {
      throw new NotFoundException('User not found');
    }
    return result;
  }
}
