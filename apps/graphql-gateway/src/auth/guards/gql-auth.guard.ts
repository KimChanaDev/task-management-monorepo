import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from '../auth.service';
import { TokenPayload, ValidateTokenResponse } from '@repo/grpc/auth';
import { GqlContext } from '../../interfaces/gql-context.interface';

@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req }: GqlContext = ctx.getContext();
    const accessToken = req.cookies?.AccessToken;

    if (!accessToken) {
      throw new UnauthorizedException('No token provided');
    }
    const result: ValidateTokenResponse =
      await this.authService.validateToken(accessToken);
    if (result.valid) {
      req['user'] = result.payload as TokenPayload;
      return true;
    } else {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
