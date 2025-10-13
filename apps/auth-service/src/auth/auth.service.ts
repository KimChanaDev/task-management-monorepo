import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
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
import { $Enums } from '@prisma/client/auth-service/index.js';
import { Prisma } from '@prisma/client/auth-service/index.js';
import { AuthRepository } from './auth.repository';
import { AuthValidation } from './auth.validation';
import { Utility } from '@repo/common/utility';
import { randomUUID } from 'crypto';
import { createHash } from 'crypto';
import { RedisService } from '../redis/redis.service';
import { UserRedisMetadata } from './interfaces/user-redis-metadata.interface';
import { ClientMetadata } from '@repo/common/interfaces';

@Injectable()
export class AuthService {
  constructor(
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

  public async login(
    user: ValidatedUserModel,
    metadata: ClientMetadata,
  ): Promise<LoginResponse> {
    const payload: UserPayload = AuthLogic.createUserPayload(
      user.id,
      user.email,
      user.username,
      user.role,
    );
    const accessToken: string = this.jwtService.sign(payload);
    const refreshToken: string = await this.createRefreshToken(user, metadata);
    await this.redisService.incrementActiveSessions(user.id);
    return {
      accessToken,
      refreshToken,
      user,
    } as LoginResponse;
  }

  private async createRefreshToken(
    user: ValidatedUserModel,
    metadata: ClientMetadata,
  ): Promise<string> {
    const expiresIn: string = this.config.getOrThrow<string>(
      'REFRESH_TOKEN_EXPIRES_IN',
    );
    const uuid: string = randomUUID();
    const refreshToken: string = createHash('sha256')
      .update(uuid)
      .digest('hex');
    const expiresAt = new Date(Date.now() + Utility.parseExpiresIn(expiresIn));

    // Generate tokenFamily for token rotation tracking
    const tokenFamily = randomUUID();

    const createData: Prisma.RefreshTokenUncheckedCreateInput = {
      token: refreshToken,
      userId: user.id,
      expiresAt,
      tokenFamily,
      deviceId: metadata.deviceId,
      deviceName: metadata.deviceName,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    };
    await this.authRepository.createRefreshToken(createData);
    await this.storeRefreshTokenInRedis(
      refreshToken,
      user,
      expiresAt,
      expiresIn,
    );
    return refreshToken;
  }

  private async storeRefreshTokenInRedis(
    refreshToken: string,
    user: ValidatedUserModel,
    expiresAt: Date,
    expiresIn: string,
  ): Promise<void> {
    const ttlInSeconds = Math.floor(Utility.parseExpiresIn(expiresIn) / 1000);
    const payload: UserRedisMetadata = {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      expiresAt: expiresAt.toISOString(),
    };
    await this.redisService.setRefreshTokenWithMetadata(
      refreshToken,
      payload,
      ttlInSeconds,
    );
  }

  async refreshAccessToken(
    refreshToken: string,
    metadata: ClientMetadata,
  ): Promise<RefreshTokenResponse> {
    const data = await this.getRefreshTokenData(refreshToken);
    await this.revokeOldRefreshToken(refreshToken);
    const newRefreshToken = await this.createRefreshToken(
      {
        id: data.userId,
        email: data.email,
        username: data.username,
        role: data.role as $Enums.Role,
        createdAt: data.createdAt,
      } as ValidatedUserModel,
      metadata,
    );
    const newAccessToken: string = this.jwtService.sign(
      AuthLogic.createUserPayload(
        data.userId,
        data.email,
        data.username,
        data.role as $Enums.Role,
      ),
    );
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    } as RefreshTokenResponse;
  }

  private async getRefreshTokenData(refreshToken: string) {
    const cachedData: UserRedisMetadata | null =
      await this.redisService.getRefreshTokenMetadata(refreshToken);

    let userId: string;
    let email: string;
    let username: string;
    let role: string;
    let createdAt: string;

    if (cachedData) {
      const expiresAt: Date = new Date(cachedData.expiresAt);
      AuthValidation.ensureCredentialNotExpired(expiresAt);
      userId = cachedData.userId;
      email = cachedData.email;
      username = cachedData.username;
      createdAt = cachedData.createdAt;
      role = cachedData.role;
    } else {
      const tokenData: Prisma.RefreshTokenGetPayload<{
        include: { user: true };
      }> | null =
        await this.authRepository.findRefreshTokenWithUser(refreshToken);
      AuthValidation.ensureValidCredential(tokenData);
      AuthValidation.ensureCredentialNotExpired(tokenData!.expiresAt);
      userId = tokenData!.user.id;
      email = tokenData!.user.email;
      username = tokenData!.user.username;
      createdAt = tokenData!.user.createdAt.toISOString();
      role = tokenData!.user.role;
    }
    return { userId, email, username, role, createdAt };
  }

  private async revokeOldRefreshToken(refreshToken: string): Promise<void> {
    await this.authRepository.revokeRefreshToken(refreshToken);
    await this.redisService.deleteRefreshToken(refreshToken);
  }

  async logout(userId: string, refreshToken: string) {
    await this.revokeOldRefreshToken(refreshToken);
    await this.redisService.decrementActiveSessions(userId);
    return { message: 'Logged out successfully' } as LogoutResponse;
  }

  public validateToken(token: string) {
    try {
      const payload: UserPayload = this.jwtService.verify(token);
      return payload;
    } catch {
      return null;
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
