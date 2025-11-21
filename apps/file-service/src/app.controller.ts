import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly configService: ConfigService,
    private readonly appService: AppService,
  ) {}

  @Get('healthcheck')
  ready() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'file-service',
      version: this.configService.getOrThrow<string>('APP_VERSION'),
    };
  }
  @Get('healthcheck/check')
  check() {
    return this.appService.check();
  }
}
