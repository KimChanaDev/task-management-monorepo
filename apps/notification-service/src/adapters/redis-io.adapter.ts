import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Redis IO Adapter for Socket.IO
 *
 * This adapter enables Socket.IO to work across multiple pods/instances
 * by using Redis Pub/Sub for message broadcasting.
 *
 * How it works:
 * 1. Each pod connects to the same Redis instance
 * 2. When a message is emitted, it's published to Redis
 * 3. All pods subscribed to Redis receive the message
 * 4. Each pod broadcasts to its locally connected clients
 */
export class RedisIoAdapter extends IoAdapter {
  private readonly logger = new Logger(RedisIoAdapter.name);
  private adapterConstructor: ReturnType<typeof createAdapter> | null = null;

  constructor(
    app: INestApplication,
    private readonly configService: ConfigService,
  ) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    const redisUrl = this.configService.get<string>('REDIS_URL');

    if (!redisUrl) {
      this.logger.warn(
        'REDIS_URL not configured. Using default in-memory adapter (not recommended for production)',
      );
      return;
    }

    try {
      // Create two Redis clients: one for publishing, one for subscribing
      const pubClient = new Redis(redisUrl);
      const subClient = pubClient.duplicate();

      // Handle Redis connection events
      pubClient.on('connect', () => {
        this.logger.log('Redis Pub client connected');
      });

      pubClient.on('error', (err) => {
        this.logger.error('Redis Pub client error:', err);
      });

      subClient.on('connect', () => {
        this.logger.log('Redis Sub client connected');
      });

      subClient.on('error', (err) => {
        this.logger.error('Redis Sub client error:', err);
      });

      // Wait for both clients to be ready
      await Promise.all([
        new Promise<void>((resolve) => pubClient.once('ready', resolve)),
        new Promise<void>((resolve) => subClient.once('ready', resolve)),
      ]);

      // Create the adapter constructor
      this.adapterConstructor = createAdapter(pubClient, subClient);

      this.logger.log('✅ Redis adapter initialized successfully');
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: '*',
        credentials: true,
      },
    });

    // Apply Redis adapter if available
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
      this.logger.log('🔌 Socket.IO using Redis adapter');
    } else {
      this.logger.warn('⚠️ Socket.IO using default in-memory adapter');
    }

    return server;
  }
}
