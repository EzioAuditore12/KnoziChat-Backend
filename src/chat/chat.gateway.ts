import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type {
  AuthenticatedSocket,
  AuthJwtPayload,
  SocketError,
} from 'src/auth/types/auth-jwt-payload';
import { WSAuthMiddleware } from 'src/auth/middlewares/ws-auth.middleware';

// 1. REMOVE @UseGuards(WsJwtGuard)
@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection
{
  @WebSocketServer() server: Server;
  ONLINE_USERS = new Map<string, string>();

  constructor(private readonly jwtService: JwtService) {}

  afterInit(server: Server) {
    const wsAuthMiddleware = WSAuthMiddleware(this.jwtService);

    server.use(wsAuthMiddleware);
  }

  handleConnection(client: AuthenticatedSocket) {
    const userId = client.handshake.user.id;

    if (!userId) {
      client.disconnect();
      return;
    }

    const newSocketId = client.id;

    this.ONLINE_USERS.set(userId, newSocketId);

    Logger.log(this.ONLINE_USERS);

    this.server.emit('online:users', Array.from(this.ONLINE_USERS.keys()));
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.handshake.user.id;

    const newSocketId = client.id;

    if (userId && this.ONLINE_USERS.get(userId) === newSocketId) {
      this.ONLINE_USERS.delete(userId);

      this.server.emit('online:users', Array.from(this.ONLINE_USERS.keys()));

      client.disconnect();

      return;
    }
  }
}
