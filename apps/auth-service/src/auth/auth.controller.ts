import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthServiceController,
  AuthServiceControllerMethods,
  type LoginRequest,
  type LoginResponse,
  type LogoutRequest,
  type LogoutResponse,
  type RefreshTokenRequest,
  type RefreshTokenResponse,
  type RegisterRequest,
  type RegisterResponse,
  type ValidateTokenRequest,
  type ValidateTokenResponse,
  type ValidateUserRequest,
  type ValidateUserResponse,
} from '@repo/grpc/auth';
import { ValidatedUserModel } from './interfaces/validated-user.interface';

@Controller()
@AuthServiceControllerMethods()
export class AuthController implements AuthServiceController {
  constructor(private readonly authService: AuthService) {}

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return await this.authService.register(
      data.email,
      data.username,
      data.password,
    );
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const user: ValidatedUserModel = await this.authService.validateUser(
      data.email,
      data.password,
    );
    return await this.authService.login(user);
  }

  validateToken(data: ValidateTokenRequest): ValidateTokenResponse {
    const payload = this.authService.validateToken(data.token);
    return { valid: true, payload } as ValidateTokenResponse;
  }

  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    return await this.authService.refreshAccessToken(data.refreshToken);
  }

  async logout(data: LogoutRequest): Promise<LogoutResponse> {
    return await this.authService.logout(data.userId, data.refreshToken);
  }

  async validateUser(data: ValidateUserRequest): Promise<ValidateUserResponse> {
    return await this.authService.validateUserById(data.userId);
  }
}
