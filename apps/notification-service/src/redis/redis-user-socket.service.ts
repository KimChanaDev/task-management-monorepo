import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
/**
 * Redis User Socket Service
 *
 * Manages user-socket mappings in Redis for horizontal scaling.
 * When multiple pods are running, each pod needs to know which
 * users are connected to which sockets across all pods.
 *
 * Redis Keys Structure:
 * - user:sockets:{userId} -> Set of socketIds
 * - socket:user:{socketId} -> userId (reverse mapping for cleanup)
 */
@Injectable()
export class RedisUserSocketService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisUserSocketService.name);
  private redis: Redis | null = null;
  private readonly USER_SOCKETS_PREFIX = 'user:sockets:';
  private readonly SOCKET_USER_PREFIX = 'socket:user:';

  // TTL for socket entries (in seconds) - auto cleanup for stale connections
  private readonly SOCKET_TTL = 86400; // 24 hours

  constructor(private readonly configService: ConfigService) {
    this.initRedis();
  }

  private initRedis(): void {
    const redisUrl = this.configService.get<string>('REDIS_URL');

    if (!redisUrl) {
      this.logger.warn(
        'REDIS_URL not configured. User-socket mapping will use in-memory fallback.',
      );
      return;
    }

    try {
      this.redis = new Redis(redisUrl);

      this.redis.on('connect', () => {
        this.logger.log('Connected to Redis for user-socket mapping');
      });

      this.redis.on('error', (err) => {
        this.logger.error('Redis connection error:', err);
      });
    } catch (error) {
      this.logger.error('Failed to initialize Redis client:', error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.logger.log('Redis connection closed');
    }
  }

  isRedisAvailable(): boolean {
    return this.redis !== null && this.redis.status === 'ready';
  }

  /**
   * Add socket to user mapping
   */
  async addUserSocket(userId: string, socketId: string): Promise<void> {
    if (!this.isRedisAvailable()) {
      return;
    }

    const userKey = `${this.USER_SOCKETS_PREFIX}${userId}`;
    const socketKey = `${this.SOCKET_USER_PREFIX}${socketId}`;

    const pipeline = this.redis!.pipeline();

    // Add socket to user's set
    // before: user:sockets:user123 = { "socket_xyz" }
    // after: user:sockets:user123 = { "socket_xyz", "socket_abc" }
    pipeline.sadd(userKey, socketId);
    pipeline.expire(userKey, this.SOCKET_TTL);

    // Add reverse mapping
    // String key-value
    pipeline.set(socketKey, userId);
    pipeline.expire(socketKey, this.SOCKET_TTL);

    // normaly (no pipeline):
    //   Client → SADD → Redis → Response
    //   Client → EXPIRE → Redis → Response
    //   Client → SET → Redis → Response
    //   Client → EXPIRE → Redis → Response
    //   = 4 round trips ❌

    // using Pipeline:
    //   Client → [SADD, EXPIRE, SET, EXPIRE] → Redis → [Responses]
    //   = 1 round trip ✅
    await pipeline.exec();

    this.logger.debug(`Added socket ${socketId} to user ${userId}`);
  }

  /**
   * Remove socket from user mapping
   */
  async removeSocket(socketId: string): Promise<void> {
    if (!this.isRedisAvailable()) {
      return;
    }

    const socketKey = `${this.SOCKET_USER_PREFIX}${socketId}`;

    // Get user ID from reverse mapping
    const userId = await this.redis!.get(socketKey);

    if (userId) {
      const userKey = `${this.USER_SOCKETS_PREFIX}${userId}`;

      const pipeline = this.redis!.pipeline();

      // Remove socket from user's set
      pipeline.srem(userKey, socketId);

      // Remove reverse mapping
      pipeline.del(socketKey);

      await pipeline.exec();

      this.logger.debug(`Removed socket ${socketId} from user ${userId}`);
    }
  }

  /**
   * Get all socket IDs for a user
   */
  async getUserSockets(userId: string): Promise<string[]> {
    if (!this.isRedisAvailable()) {
      return [];
    }

    const userKey = `${this.USER_SOCKETS_PREFIX}${userId}`;
    return await this.redis!.smembers(userKey);
  }

  /**
   * Check if user has any connected sockets
   */
  async isUserConnected(userId: string): Promise<boolean> {
    if (!this.isRedisAvailable()) {
      return false;
    }

    const userKey = `${this.USER_SOCKETS_PREFIX}${userId}`;
    const count = await this.redis!.scard(userKey);
    return count > 0;
  }

  /**
   * Get total connected users count (approximate)
   */
  async getConnectedUsersCount(): Promise<number> {
    if (!this.isRedisAvailable()) {
      return 0;
    }

    // This is an approximation - counts keys matching pattern
    const keys = await this.redis!.keys(`${this.USER_SOCKETS_PREFIX}*`);
    return keys.length;
  }

  /**
   * Get user ID by socket ID
   */
  async getUserBySocket(socketId: string): Promise<string | null> {
    if (!this.isRedisAvailable()) {
      return null;
    }

    const socketKey = `${this.SOCKET_USER_PREFIX}${socketId}`;
    return await this.redis!.get(socketKey);
  }
}
