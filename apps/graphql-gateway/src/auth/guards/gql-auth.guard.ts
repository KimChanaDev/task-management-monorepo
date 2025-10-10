import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from '../auth.service';
import {
  RefreshTokenResponse,
  TokenPayload,
  ValidateTokenResponse,
} from '@repo/grpc/auth';
import { status } from '@grpc/grpc-js';
import { GqlContext } from 'src/interfaces/gql-context.interface';

@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req, res }: GqlContext = ctx.getContext();
    let accessToken = req.cookies?.AccessToken;
    const refreshToken = req.cookies?.RefreshToken;

    if (!accessToken && !refreshToken) {
      throw new UnauthorizedException('No token provided');
    }
    if (!accessToken && refreshToken) {
      const newAccessToken: RefreshTokenResponse =
        await this.authService.refreshToken(refreshToken, res);
      accessToken = newAccessToken.accessToken;
    }

    try {
      const result: ValidateTokenResponse =
        await this.authService.validateToken(accessToken);
      const payload: TokenPayload = result.payload!;
      req.user = payload;
      return true;
    } catch (error) {
      if (error.code === status.DEADLINE_EXCEEDED) {
        const newAccessToken: RefreshTokenResponse =
          await this.authService.refreshToken(refreshToken, res);
        const result: ValidateTokenResponse =
          await this.authService.validateToken(newAccessToken.accessToken);
        const payload: TokenPayload = result.payload!;
        req.user = payload;
        return true;
      } else {
        throw new UnauthorizedException(
          `Token validation failed: ${error.message}`,
        );
      }
    }
  }
}
