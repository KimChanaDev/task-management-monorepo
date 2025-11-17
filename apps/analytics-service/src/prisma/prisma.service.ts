import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client/analytics-service/index.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Connected to Analytics Database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('👋 Disconnected from Analytics Database');
  }
}
