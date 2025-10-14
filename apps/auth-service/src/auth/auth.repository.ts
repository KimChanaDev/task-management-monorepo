import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client/auth-service/index.js';
import { Injectable, Logger } from '@nestjs/common';
import { InternalRpcException } from '@repo/grpc/exception';

@Injectable()
export class AuthRepository {
  private readonly logger = new Logger(AuthRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  async findUser(
    where: Prisma.UserWhereInput,
    select?: Prisma.UserSelect,
  ): Promise<Prisma.UserGetPayload<{ select: typeof select }> | null> {
    let user: Prisma.UserGetPayload<{ select: typeof select }> | null;
    try {
      user = await this.prisma.user.findFirst({
        where,
        select,
      });
    } catch (error) {
      this.logger.error(`Failed to get user: ${error.message}`);
      throw new InternalRpcException(`Failed to get user: ${error.message}`);
    }
    return user;
  }

  async findUniqueUser(
    where: Prisma.UserWhereUniqueInput,
    select?: Prisma.UserSelect,
  ): Promise<Prisma.UserGetPayload<{ select: typeof select }> | null> {
    let user: Prisma.UserGetPayload<{ select: typeof select }> | null;
    try {
      user = await this.prisma.user.findUnique({
        where,
        select,
      });
    } catch (error) {
      this.logger.error(`Failed to get user: ${error.message}`);
      throw new InternalRpcException(`Failed to get user: ${error.message}`);
    }
    return user;
  }

  async createUser(
    data: Prisma.UserCreateInput,
    select?: Prisma.UserSelect,
  ): Promise<Prisma.UserGetPayload<{ select: typeof select }>> {
    try {
      const user: Prisma.UserGetPayload<{ select: typeof select }> =
        await this.prisma.user.create({
          data,
          select,
        });
      return user;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      throw new InternalRpcException(`Failed to create user: ${error.message}`);
    }
  }

  async createRefreshToken(
    data: Prisma.RefreshTokenUncheckedCreateInput,
    select?: Prisma.RefreshTokenSelect,
  ): Promise<Prisma.RefreshTokenGetPayload<{ select: typeof select }>> {
    try {
      const refreshToken: Prisma.RefreshTokenGetPayload<{
        select: typeof select;
      }> = await this.prisma.refreshToken.create({
        data,
        select,
      });
      return refreshToken;
    } catch (error) {
      this.logger.error(`Failed to create refresh token: ${error.message}`);
      throw new InternalRpcException(
        `Failed to create refresh token: ${error.message}`,
      );
    }
  }

  async deleteRefreshToken(userId: string, refreshToken: string) {
    try {
      await this.prisma.refreshToken.deleteMany({
        where: {
          userId,
          token: refreshToken,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to delete refresh token: ${error.message}`);
      throw new InternalRpcException(
        `Failed to delete refresh token: ${error.message}`,
      );
    }
  }

  async deleteAllRefreshTokensByUserId(userId: string) {
    try {
      await this.prisma.refreshToken.deleteMany({
        where: {
          userId,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to delete all refresh tokens: ${error.message}`,
      );
      throw new InternalRpcException(
        `Failed to delete all refresh tokens: ${error.message}`,
      );
    }
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    try {
      await this.prisma.refreshToken.update({
        where: { token: refreshToken },
        data: {
          isRevoked: true,
          revokedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to revoke refresh token: ${error.message}`);
      throw new InternalRpcException(
        `Failed to revoke refresh token: ${error.message}`,
      );
    }
  }

  async findRefreshTokenWithUser(
    refreshToken: string,
  ): Promise<Prisma.RefreshTokenGetPayload<{
    include: { user: true };
  }> | null> {
    try {
      return await this.prisma.refreshToken.findUnique({
        where: {
          token: refreshToken,
          isRevoked: false,
        },
        include: {
          user: true,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to find refresh token with user: ${error.message}`,
      );
      throw new InternalRpcException(
        `Failed to find refresh token with user: ${error.message}`,
      );
    }
  }

  async findRefreshTokenRevoke(refreshToken: string): Promise<{
    userId: string;
    tokenFamily: string;
    isRevoked: boolean;
  } | null> {
    try {
      return await this.prisma.refreshToken.findUnique({
        where: {
          token: refreshToken,
        },
        select: {
          userId: true,
          tokenFamily: true,
          isRevoked: true,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to find refresh token: ${error.message}`);
      throw new InternalRpcException(
        `Failed to find refresh token: ${error.message}`,
      );
    }
  }

  async revokeTokenFamily(tokenFamily: string): Promise<void> {
    try {
      await this.prisma.refreshToken.updateMany({
        where: {
          tokenFamily,
          isRevoked: false,
        },
        data: {
          isRevoked: true,
          revokedAt: new Date(),
        },
      });
      this.logger.warn(
        `Token family ${tokenFamily} has been revoked due to potential token reuse`,
      );
    } catch (error) {
      this.logger.error(`Failed to revoke token family: ${error.message}`);
      throw new InternalRpcException(
        `Failed to revoke token family: ${error.message}`,
      );
    }
  }

  async deleteExpiredRefreshTokens(): Promise<number> {
    try {
      const result = await this.prisma.refreshToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
      this.logger.log(
        `🗑️ Deleted ${result.count} expired refresh tokens from database`,
      );
      return result.count;
    } catch (error) {
      this.logger.error(
        `Failed to delete expired refresh tokens: ${error.message}`,
      );
      throw new InternalRpcException(
        `Failed to delete expired refresh tokens: ${error.message}`,
      );
    }
  }

  async deleteOldRevokedTokens(daysOld = 1): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await this.prisma.refreshToken.deleteMany({
        where: {
          isRevoked: true,
          revokedAt: {
            lt: cutoffDate,
          },
        },
      });
      this.logger.log(
        `🗑️ Deleted ${result.count} old revoked tokens (older than ${daysOld} days)`,
      );
      return result.count;
    } catch (error) {
      this.logger.error(
        `Failed to delete old revoked tokens: ${error.message}`,
      );
      throw new InternalRpcException(
        `Failed to delete old revoked tokens: ${error.message}`,
      );
    }
  }
}
