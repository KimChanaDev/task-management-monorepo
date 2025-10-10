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

  async findRefreshToken(
    refreshToken: string,
  ): Promise<Prisma.RefreshTokenGetPayload<{
    include: { user: true };
  }> | null> {
    try {
      const token: Prisma.RefreshTokenGetPayload<{
        include: { user: true };
      }> | null = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });
      return token;
    } catch (error) {
      this.logger.error(`Failed to get refresh token: ${error.message}`);
      throw new InternalRpcException(
        `Failed to get refresh token: ${error.message}`,
      );
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
}
