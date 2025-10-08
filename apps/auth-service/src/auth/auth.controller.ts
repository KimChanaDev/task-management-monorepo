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
import { ValidatedUserModel } from '../interfaces/validated-user.interface';

@Controller()
@AuthServiceControllerMethods()
export class AuthController implements AuthServiceController {
  constructor(private readonly authService: AuthService) {}

  async register(data: RegisterRequest) {
    const response: RegisterResponse = await this.authService.register(
      data.email,
      data.username,
      data.password,
    );
    return response;
  }

  async login(data: LoginRequest) {
    const user: ValidatedUserModel = await this.authService.validateUser(
      data.email,
      data.password,
    );
    const tokens: LoginResponse = await this.authService.login(user);
    return tokens;
  }

  validateToken(data: ValidateTokenRequest) {
    const payload = this.authService.validateToken(data.token);
    return { valid: true, payload } as ValidateTokenResponse;
  }

  async refreshToken(data: RefreshTokenRequest) {
    const response: RefreshTokenResponse =
      await this.authService.refreshAccessToken(data.refreshToken);
    return response;
  }

  async logout(data: LogoutRequest) {
    const response: LogoutResponse = await this.authService.logout(
      data.userId,
      data.refreshToken,
    );
    return response;
  }

  async validateUser(data: ValidateUserRequest): Promise<ValidateUserResponse> {
    const response: ValidateUserResponse =
      await this.authService.validateUserById(data.userId);
    return response;
  }
}
