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
import { AuthDto, UserDto } from './dto/user.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Utility } from '@repo/common/utility';

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

  async register(
    email: string,
    password: string,
    username: string,
  ): Promise<UserDto> {
    const request: RegisterRequest = {
      email,
      password,
      username,
    };
    const result: RegisterResponse = await firstValueFrom(
      this.authExternalService.register(request),
    );
    return result.user as UserDto;
  }

  async login(
    email: string,
    password: string,
    response: Response,
  ): Promise<AuthDto> {
    const request: LoginRequest = { email, password };
    const result: LoginResponse = await firstValueFrom(
      this.authExternalService.login(request),
    );

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

    response.cookie('AccessToken', result.accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'strict',
      maxAge: Utility.parseExpiresIn(accessTokenExpiresIn),
    });

    response.cookie('RefreshToken', result.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'strict',
      maxAge: Utility.parseExpiresIn(refreshTokenExpiresIn),
    });
    return result as AuthDto;
  }

  async validateToken(token: string): Promise<ValidateTokenResponse> {
    const request: ValidateTokenRequest = { token };
    const result: ValidateTokenResponse = await firstValueFrom(
      this.authExternalService.validateToken(request),
    ).catch((error) => {
      throw new Error(`Internal (auth) service error: ${error.message}`);
    });
    return result;
  }

  async refreshToken(refreshToken: string, response: Response) {
    const request: RefreshTokenRequest = { refreshToken };
    const result: RefreshTokenResponse = await firstValueFrom(
      this.authExternalService.refreshToken(request),
    );

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

    response.cookie('AccessToken', result.accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'strict',
      maxAge: Utility.parseExpiresIn(accessTokenExpiresIn),
    });
    return result as AuthDto;
  }

  async getUser(userId: string): Promise<ValidateUserResponse> {
    const request: ValidateUserRequest = { userId };
    const result: ValidateUserResponse = await firstValueFrom(
      this.authExternalService.validateUser(request),
    );
    if (!result.valid || !result.user) {
      throw new NotFoundException('User not found');
    }
    return result;
  }
}
