import { Injectable } from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import {
  LoginResponse,
  LogoutResponse,
  RefreshTokenResponse,
  RegisterResponse,
  ValidateUserResponse,
} from '@repo/grpc/auth';
import { ValidatedUserModel } from './interfaces/validated-user.interface';
import { UserPayload } from './interfaces/user-payload.interface';
import { ConfigService } from '@nestjs/config';
import { AuthLogic } from './auth.logic';
import {
  DeadlineExceededRpcException,
  UnAuthenticateRpcException,
} from '@repo/grpc/exception';
import { Prisma } from '@prisma/client/auth-service/index.js';
import { AuthRepository } from './auth.repository';
import { AuthValidation } from './auth.validation';
import { Utility } from '@repo/common/utility';
import { randomUUID } from 'crypto';
import { createHash } from 'crypto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly authRepository: AuthRepository,
    private readonly redisService: RedisService,
  ) {}
  public async validateUser(
    email: string,
    password: string,
  ): Promise<ValidatedUserModel> {
    const user = await this.authRepository.findUniqueUser(
      AuthLogic.userWhereUniqueEmail(email),
      AuthLogic.userSelect(),
    );
    AuthValidation.ensureUserFound(user);
    const isPasswordValid = await bcrypt.compare(password, user!.password);
    AuthValidation.ensureValidCredential(isPasswordValid);

    return {
      ...user,
      createdAt: user!.createdAt.toISOString(),
    } as ValidatedUserModel;
  }

  public async register(
    email: string,
    username: string,
    password: string,
  ): Promise<RegisterResponse> {
    const existingUser = await this.authRepository.findUser(
      AuthLogic.userWhereEmailOrUsername(email, username),
    );
    AuthValidation.ensureUserNotExists(existingUser);
    const hashedPassword = await bcrypt.hash(password, 10);
    const createData: Prisma.UserCreateInput = {
      email,
      username,
      password: hashedPassword,
    };
    const createdUser = await this.authRepository.createUser(
      createData,
      AuthLogic.userSelectWithoutPassword(),
    );
    return {
      user: { ...createdUser, createdAt: createdUser.createdAt.toISOString() },
    } as RegisterResponse;
  }

  public async login(user: ValidatedUserModel): Promise<LoginResponse> {
    const payload: UserPayload = AuthLogic.createUserPayload(
      user.id,
      user.email,
      user.username,
      user.role,
    );
    const accessToken: string = this.jwtService.sign(payload);
    const refreshToken: string = await this.createRefreshToken(user.id);
    return {
      accessToken,
      refreshToken,
      user,
    } as LoginResponse;
  }

  private async createRefreshToken(userId: string): Promise<string> {
    const expiresIn: string = this.config.getOrThrow<string>(
      'REFRESH_TOKEN_EXPIRES_IN',
    );
    const uuid: string = randomUUID();
    const refreshToken: string = createHash('sha256')
      .update(uuid)
      .digest('hex');
    const createData: Prisma.RefreshTokenUncheckedCreateInput = {
      token: refreshToken,
      userId,
      expiresAt: new Date(Date.now() + Utility.parseExpiresIn(expiresIn)),
    };
    await this.authRepository.createRefreshToken(createData);
    await this.storeRefreshTokenInRedis(refreshToken, userId, expiresIn);
    return refreshToken;
  }

  private async storeRefreshTokenInRedis(
    refreshToken: string,
    userId: string,
    expiresIn: string,
  ): Promise<void> {
    const ttlInSeconds = Math.floor(Utility.parseExpiresIn(expiresIn) / 1000);
    await this.redisService.setRefreshToken(refreshToken, userId, ttlInSeconds);
    await this.redisService.incrementActiveSessions(userId);
  }

  private async removeRefreshTokenFromRedis(
    refreshToken: string,
    userId: string,
  ): Promise<void> {
    await this.redisService.deleteRefreshToken(refreshToken);
    await this.redisService.decrementActiveSessions(userId);
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<RefreshTokenResponse> {
    try {
      this.jwtService.verify(refreshToken);
    } catch (error) {
      throw new UnAuthenticateRpcException(
        `Invalid refresh token: ${error.message}`,
      );
    }
    const token: Prisma.RefreshTokenGetPayload<{
      include: { user: true };
    }> | null = await this.authRepository.findRefreshToken(refreshToken);
    AuthValidation.ensureValidCredential(token);
    AuthValidation.ensureCredentialNotExpired(token!.expiresAt);
    const payload: UserPayload = AuthLogic.createUserPayload(
      token!.user.id,
      token!.user.email,
      token!.user.username,
      token!.user.role,
    );
    const newAccessToken: string = this.jwtService.sign(payload);
    return { accessToken: newAccessToken } as RefreshTokenResponse;
  }

  async logout(userId: string, refreshToken: string) {
    await this.authRepository.deleteRefreshToken(userId, refreshToken);
    await this.removeRefreshTokenFromRedis(refreshToken, userId);
    return { message: 'Logged out successfully' } as LogoutResponse;
  }

  public validateToken(token: string) {
    try {
      const payload: UserPayload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new DeadlineExceededRpcException('Token has expired');
      } else {
        throw new UnAuthenticateRpcException(`Invalid token: ${error.message}`);
      }
    }
  }

  public async validateUserById(userId: string): Promise<ValidateUserResponse> {
    const where: Prisma.UserWhereUniqueInput =
      AuthLogic.userWhereUniqueId(userId);
    const select: Prisma.UserSelect = AuthLogic.userSelectWithoutPassword();
    const user = await this.authRepository.findUniqueUser(where, select);
    if (!user) {
      return { valid: false, user: undefined } as ValidateUserResponse;
    }
    return {
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
    } as ValidateUserResponse;
  }

  public async getUserActiveSessions(userId: string): Promise<number> {
    return await this.redisService.getActiveSessions(userId);
  }

  public async logoutAllSessions(userId: string): Promise<void> {
    await this.authRepository.deleteAllRefreshTokensByUserId(userId);
    await this.redisService.deleteAllSessions(userId);
  }
}
