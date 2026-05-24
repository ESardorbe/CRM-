import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket, MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service';

@WebSocketGateway({ cors: { origin: 'http://localhost:5173', credentials: true } })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token ?? client.handshake.headers?.authorization?.split(' ')[1];
      if (!token) { client.disconnect(); return; }
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET_KEY });
      const userId: string = payload.sub ?? payload.id;
      client.data.userId = userId;
      if (!this.userSockets.has(userId)) this.userSockets.set(userId, new Set());
      this.userSockets.get(userId)!.add(client.id);
      client.join(`user:${userId}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    if (userId) {
      this.userSockets.get(userId)?.delete(client.id);
      if (this.userSockets.get(userId)?.size === 0) this.userSockets.delete(userId);
    }
  }

  @SubscribeMessage('mark-read')
  async handleMarkRead(@ConnectedSocket() client: Socket, @MessageBody() id: string) {
    const userId = client.data?.userId;
    if (userId) await this.notificationsService.markRead(id, userId);
  }

  async sendToUser(userId: string, notification: { title: string; body: string; type?: string; link?: string }) {
    const saved = await this.notificationsService.create(userId, notification.title, notification.body, notification.type, notification.link);
    this.server.to(`user:${userId}`).emit('notification', saved);
    return saved;
  }
}
