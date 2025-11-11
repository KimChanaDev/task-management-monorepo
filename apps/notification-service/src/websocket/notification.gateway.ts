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
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Remove socket from user mapping
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
        break;
      }
    }
  }

  @SubscribeMessage('authenticate')
  handleAuthenticate(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ) {
    const { userId } = message;
    this.logger.log(`Client ${client.id} authenticated as user ${userId}`);

    // Add socket to user mapping
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(client.id);

    return { event: 'authenticated', data: { userId } }; //emit back to client
  }

  /**
   * Send notification to a specific user
   */
  sendNotificationToUser(userId: string, notification: Notification) {
    const socketsByUser: Set<string> | undefined = this.userSockets.get(userId);

    if (socketsByUser && socketsByUser.size > 0) {
      for (const socketId of socketsByUser) {
        this.server.to(socketId).emit('notification', notification); //emit to all devices of the user
      }
      this.logger.log(
        `Sent notification to user ${userId} (${socketsByUser.size} sockets)`,
      );
    } else {
      this.logger.debug(`User ${userId} is not connected`);
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
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: string): boolean {
    return (
      this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0
    );
  }
}
