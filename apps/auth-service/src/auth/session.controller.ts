import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth/sessions')
export class SessionController {
  constructor(private readonly authService: AuthService) {}

  @Get('count/:userId')
  async getActiveSessions(@Param('userId') userId: string) {
    const count = await this.authService.getUserActiveSessions(userId);
    return {
      userId,
      activeSessions: count,
    };
  }

  @Post('logout-all')
  async logoutAllSessions(@Body('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    await this.authService.logoutAllSessions(userId);
    return {
      message: 'Successfully logged out from all sessions',
      userId,
    };
  }
}
