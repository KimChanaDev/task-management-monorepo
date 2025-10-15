import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  @Get('healthcheck')
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'graphql-gateway',
      version: this.configService.getOrThrow<string>('APP_VERSION'),
    };
  }
}
