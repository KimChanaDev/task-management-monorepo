import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.config.getOrThrow('REDIS_HOST'),
      port: this.config.getOrThrow('REDIS_PORT'),
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    this.client.on('error', (error) => {
      console.error('❌ Redis connection error:', error);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async setRefreshToken(
    refreshToken: string,
    userId: string,
    ttlInSeconds: number,
  ): Promise<void> {
    const key = `refresh_token:${refreshToken}`;
    await this.client.setex(key, ttlInSeconds, userId);
  }

  async getUserIdFromRefreshToken(
    refreshToken: string,
  ): Promise<string | null> {
    const key = `refresh_token:${refreshToken}`;
    return await this.client.get(key);
  }

  async deleteRefreshToken(refreshToken: string): Promise<void> {
    const key = `refresh_token:${refreshToken}`;
    await this.client.del(key);
  }

  async incrementActiveSessions(userId: string): Promise<number> {
    const key = `user:${userId}:active_sessions`;
    return await this.client.incr(key);
  }

  async decrementActiveSessions(userId: string): Promise<number> {
    const key = `user:${userId}:active_sessions`;
    const count = await this.client.decr(key);

    if (count < 0) {
      await this.client.set(key, 0);
      return 0;
    }

    return count;
  }

  async getActiveSessions(userId: string): Promise<number> {
    const key = `user:${userId}:active_sessions`;
    const count = await this.client.get(key);
    return count ? parseInt(count, 10) : 0;
  }

  async deleteAllSessions(userId: string): Promise<void> {
    const key = `user:${userId}:active_sessions`;
    await this.client.del(key);
  }

  async getRefreshTokenTTL(refreshToken: string): Promise<number> {
    const key = `refresh_token:${refreshToken}`;
    return await this.client.ttl(key);
  }
}
