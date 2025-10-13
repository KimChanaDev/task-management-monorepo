import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto, AuthDto, MessageDto } from './dto/user.dto';
import { RegisterInput, LoginInput } from './dto/auth.input';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { ValidateUserResponse, type TokenPayload } from '@repo/grpc/auth';
import { type GqlContext } from 'src/interfaces/gql-context.interface';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => UserDto)
  async register(@Args('input') input: RegisterInput): Promise<UserDto> {
    return await this.authService.register(
      input.email,
      input.password,
      input.name,
    );
  }

  @Mutation(() => AuthDto)
  async login(
    @Args('input') input: LoginInput,
    @Context() context: GqlContext,
  ): Promise<AuthDto> {
    return await this.authService.login(
      input.email,
      input.password,
      context.res,
    );
  }

  @Mutation(() => MessageDto)
  async refreshAccessToken(
    @Context() context: GqlContext,
  ): Promise<MessageDto> {
    const refreshToken = context.req.cookies?.RefreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('No token provided');
    }
    return await this.authService.refreshAccessToken(refreshToken, context.res);
  }

  @Mutation(() => MessageDto)
  @UseGuards(GqlAuthGuard)
  async logout(
    @CurrentUser() user: TokenPayload,
    @Context() context: GqlContext,
  ): Promise<MessageDto> {
    const refreshToken = context.req.cookies?.RefreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('No token provided');
    }
    return await this.authService.logout(user.sub, refreshToken, context.res);
  }

  @Query(() => UserDto)
  @UseGuards(GqlAuthGuard)
  me(@CurrentUser() user: TokenPayload): UserDto {
    return { ...user, id: user.sub };
  }

  @Query(() => UserDto, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async user(@Args('id') id: string): Promise<UserDto> {
    const result: ValidateUserResponse = await this.authService.getUser(id);
    return result.user as UserDto;
  }
}
