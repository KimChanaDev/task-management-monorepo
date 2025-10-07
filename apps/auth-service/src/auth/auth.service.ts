import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import {
  LoginResponse,
  LogoutResponse,
  RefreshTokenResponse,
  RegisterResponse,
} from '@repo/grpc/auth';
import { ValidatedUserModel } from '../interfaces/validated-user.interface';
import { UserPayload } from '../interfaces/user-payload.interface';
import { ConfigService } from '@nestjs/config';
import { AuthLogic } from './auth.logic';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  public async validateUser(
    email: string,
    password: string,
  ): Promise<ValidatedUserModel> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        password: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const response: ValidatedUserModel = {
      ...user,
      createdAt: String(user.createdAt),
    };
    return response;
  }

  public async register(
    email: string,
    username: string,
    password: string,
  ): Promise<RegisterResponse> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new ConflictException('Email or username already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    const response: RegisterResponse = {
      user: {
        id: String(createdUser.id),
        email: String(createdUser.email),
        username: String(createdUser.username),
        role: String(createdUser.role),
        createdAt: String(createdUser.createdAt),
      },
    };
    return response;
  }

  public async login(user: ValidatedUserModel) {
    const payload: UserPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const accessToken: string = this.jwtService.sign(payload);
    const refreshToken: string = await this.createRefreshToken(user.id);
    const response: LoginResponse = {
      accessToken,
      refreshToken,
      user,
    };
    return response;
  }

  private async createRefreshToken(userId: string): Promise<string> {
    const expiresIn: string = this.config.getOrThrow<string>(
      'REFRESH_TOKEN_EXPIRES_IN',
    );

    const token: string = this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      { expiresIn },
    );

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt: new Date(Date.now() + AuthLogic.parseExpiresIn(expiresIn)),
      },
    });

    return token;
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<RefreshTokenResponse> {
    this.jwtService.verify(refreshToken);

    const token = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (token.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has been expired');
    }
    const payload: UserPayload = {
      sub: token.user.id,
      email: token.user.email,
      username: token.user.username,
      role: token.user.role,
    };
    const newAccessToken: string = this.jwtService.sign(payload);

    return { accessToken: newAccessToken } as RefreshTokenResponse;
  }

  async logout(userId: string, refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        token: refreshToken,
      },
    });

    return { message: 'Logged out successfully' } as LogoutResponse;
  }

  public validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
