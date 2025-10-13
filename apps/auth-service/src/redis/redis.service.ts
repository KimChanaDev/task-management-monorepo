import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { UserRedisMetadata } from 'src/auth/interfaces/user-redis-metadata.interface';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;
  private isConnected = false;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.config.getOrThrow('REDIS_HOST'),
      port: this.config.getOrThrow('REDIS_PORT'),
      lazyConnect: true, // Don't block initialization
      connectTimeout: 2000, // Fast timeout (2 seconds)
      maxRetriesPerRequest: 1, // Only retry once per request
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 10000, 10000);
        return delay;
      },
      enableOfflineQueue: false, // Don't queue commands when offline
    });

    this.client
      .connect()
      .then(() => {
        this.isConnected = true;
        this.logger.log('✅ Redis connected successfully');
      })
      .catch((error) => {
        this.isConnected = false;
        this.logger.warn(
          `⚠️ Redis connection failed (app will continue without cache): ${error.message}`,
        );
      });

    this.client.on('connect', () => {
      this.isConnected = true;
      this.logger.log('✅ Redis reconnected successfully');
    });

    this.client.on('error', (error) => {
      this.isConnected = false;
      this.logger.warn(
        `⚠️ Redis connection error (app continues without cache): ${error.message}`,
      );
    });

    this.client.on('close', () => {
      this.isConnected = false;
      this.logger.warn(
        '⚠️ Redis connection closed (app continues without cache)',
      );
    });
  }

  async onModuleDestroy() {
    try {
      if (this.isConnected) {
        await this.client.quit();
      } else {
        this.client.disconnect();
      }
    } catch (error) {
      this.logger.warn(`Error disconnecting from Redis: ${error.message}`);
    }
  }

  private async safeExecute<T>(
    operation: () => Promise<T>,
    fallbackValue: T,
    operationName: string,
  ): Promise<T> {
    if (!this.isConnected) {
      this.logger.debug(
        `Redis not connected, using fallback for ${operationName}`,
      );
      return fallbackValue;
    }

    try {
      return await operation();
    } catch (error) {
      this.logger.warn(
        `Redis operation failed (${operationName}), using fallback: ${error.message}`,
      );
      return fallbackValue;
    }
  }

  async getUserIdFromRefreshToken(
    refreshToken: string,
  ): Promise<string | null> {
    return this.safeExecute(
      async () => {
        const key = `refresh_token:${refreshToken}`;
        return await this.client.get(key);
      },
      null,
      'getUserIdFromRefreshToken',
    );
  }

  async deleteRefreshToken(refreshToken: string): Promise<void> {
    await this.safeExecute(
      async () => {
        const key = `refresh_token:${refreshToken}`;
        await this.client.del(key);
      },
      undefined,
      'deleteRefreshToken',
    );
  }

  async incrementActiveSessions(userId: string): Promise<number> {
    return this.safeExecute(
      async () => {
        const key = `user:${userId}:active_sessions`;
        return await this.client.incr(key);
      },
      0,
      'incrementActiveSessions',
    );
  }

  async decrementActiveSessions(userId: string): Promise<number> {
    return this.safeExecute(
      async () => {
        const key = `user:${userId}:active_sessions`;
        const count = await this.client.decr(key);

        if (count < 0) {
          await this.client.set(key, 0);
          return 0;
        }

        return count;
      },
      0,
      'decrementActiveSessions',
    );
  }

  async getActiveSessions(userId: string): Promise<number> {
    return this.safeExecute(
      async () => {
        const key = `user:${userId}:active_sessions`;
        const count = await this.client.get(key);
        return count ? parseInt(count, 10) : 0;
      },
      0,
      'getActiveSessions',
    );
  }

  async deleteAllSessions(userId: string): Promise<void> {
    await this.safeExecute(
      async () => {
        const key = `user:${userId}:active_sessions`;
        await this.client.del(key);
      },
      undefined,
      'deleteAllSessions',
    );
  }

  async getRefreshTokenTTL(refreshToken: string): Promise<number> {
    return this.safeExecute(
      async () => {
        const key = `refresh_token:${refreshToken}`;
        return await this.client.ttl(key);
      },
      -1,
      'getRefreshTokenTTL',
    );
  }

  async setRefreshTokenWithMetadata(
    refreshToken: string,
    data: UserRedisMetadata,
    ttlInSeconds: number,
  ): Promise<void> {
    await this.safeExecute(
      async () => {
        const key = `refresh_token:${refreshToken}`;
        await this.client.setex(key, ttlInSeconds, JSON.stringify(data));
      },
      undefined,
      'setRefreshTokenWithMetadata',
    );
  }

  async getRefreshTokenMetadata(
    refreshToken: string,
  ): Promise<UserRedisMetadata | null> {
    return this.safeExecute(
      async () => {
        const key = `refresh_token:${refreshToken}`;
        const data = await this.client.get(key);
        if (!data) return null;
        try {
          return JSON.parse(data);
        } catch {
          return null;
        }
      },
      null,
      'getRefreshTokenMetadata',
    );
  }
}
