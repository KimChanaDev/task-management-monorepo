import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Notification } from '@repo/socket/types';
import { RedisUserSocketService } from '../redis/redis-user-socket.service';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, specify allowed origins
    credentials: true,
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  // In-memory fallback when Redis is not available
  private localUserSockets: Map<string, Set<string>> = new Map();

  constructor(
    private readonly redisUserSocketService: RedisUserSocketService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Try Redis first, fallback to local
    if (this.redisUserSocketService.isRedisAvailable()) {
      await this.redisUserSocketService.removeSocket(client.id);
    } else {
      // Remove from local mapping
      for (const [userId, sockets] of this.localUserSockets.entries()) {
        if (sockets.has(client.id)) {
          sockets.delete(client.id);
          if (sockets.size === 0) {
            this.localUserSockets.delete(userId);
          }
          break;
        }
      }
    }
  }

  @SubscribeMessage('authenticate')
  async handleAuthenticate(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ) {
    const { userId } = message;
    this.logger.log(`Client ${client.id} authenticated as user ${userId}`);

    // Try Redis first, fallback to local
    if (this.redisUserSocketService.isRedisAvailable()) {
      await this.redisUserSocketService.addUserSocket(userId, client.id);
    } else {
      // Add to local mapping
      if (!this.localUserSockets.has(userId)) {
        this.localUserSockets.set(userId, new Set());
      }
      this.localUserSockets.get(userId)!.add(client.id);
    }

    return { event: 'authenticated', data: { userId } };
  }

  /**
   * Send notification to a specific user
   * With Redis adapter, this will broadcast to all pods
   */
  async sendNotificationToUser(userId: string, notification: Notification) {
    if (this.redisUserSocketService.isRedisAvailable()) {
      // Get user's sockets from Redis
      const socketIds =
        await this.redisUserSocketService.getUserSockets(userId);

      if (socketIds.length > 0) {
        // Emit to each socket - Redis adapter will handle cross-pod delivery
        for (const socketId of socketIds) {
          this.server.to(socketId).emit('notification', notification);
        }
        this.logger.log(
          `Sent notification to user ${userId} (${socketIds.length} sockets)`,
        );
      } else {
        this.logger.debug(`User ${userId} is not connected`);
      }
    } else {
      // Fallback to local mapping
      const socketsByUser = this.localUserSockets.get(userId);

      if (socketsByUser && socketsByUser.size > 0) {
        for (const socketId of socketsByUser) {
          this.server.to(socketId).emit('notification', notification);
        }
        this.logger.log(
          `Sent notification to user ${userId} (${socketsByUser.size} sockets) [local]`,
        );
      } else {
        this.logger.debug(`User ${userId} is not connected [local]`);
      }
    }
  }

  /**
   * Broadcast notification to all connected users
   */
  broadcastNotification(notification: Notification) {
    this.server.emit('notification', notification);
    this.logger.log('Broadcast notification to all users');
  }

  /**
   * Get connected users count
   */
  async getConnectedUsersCount(): Promise<number> {
    if (this.redisUserSocketService.isRedisAvailable()) {
      return await this.redisUserSocketService.getConnectedUsersCount();
    }
    return this.localUserSockets.size;
  }

  /**
   * Check if user is connected
   */
  async isUserConnected(userId: string): Promise<boolean> {
    if (this.redisUserSocketService.isRedisAvailable()) {
      return await this.redisUserSocketService.isUserConnected(userId);
    }
    return (
      this.localUserSockets.has(userId) &&
      this.localUserSockets.get(userId)!.size > 0
    );
  }
}
