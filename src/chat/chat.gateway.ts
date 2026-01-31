import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';

import type { AuthenticatedSocket } from 'src/auth/types/auth-jwt-payload';
import { ChatService } from './services/chat.service';
import { SendMessageDto } from './dto/message/send-message.dto';

@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection
{
  @WebSocketServer() server: Server;

  ONLINE_USERS = new Map<string, string>();

  constructor(private readonly chatService: ChatService) {}

  afterInit(server: Server) {
    this.chatService.init(server);
  }

  handleConnection(client: AuthenticatedSocket) {
    const connectResult = this.chatService.handleConnect(client);

    if (!connectResult) {
      Logger.warn('handleConnect returned undefined');
      return;
    }

    const { userId, socketId } = connectResult;

    this.ONLINE_USERS.set(userId, socketId);

    Logger.log(this.ONLINE_USERS);

    // create personal room for user
    client.join(`user:${userId}`);

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

  @SubscribeMessage('conversation:join')
  async joinConversation(client: AuthenticatedSocket, conversationId: string) {
    const userId = client.handshake.user.id;

    Logger.log(`${userId} joining the room ${conversationId}`);

    await client.join(`conversation:${conversationId}`);
  }

  @SubscribeMessage('conversation:leave')
  async leaveConversation(client: AuthenticatedSocket, conversationId: string) {
    const userId = client.handshake.user.id;

    Logger.log(`${userId} leaving the room ${conversationId}`);

    await client.leave(`conversation:${conversationId}`);
  }

  @SubscribeMessage('message:send')
  async sendMessage(
    client: AuthenticatedSocket,
    sendMessageDto: SendMessageDto,
  ) {
    const savedMessage = await this.chatService.sendMessage(
      client,
      sendMessageDto,
    );

    // Use broadcast to send to everyone EXCEPT the sender
    client.broadcast
      .to(`conversation:${sendMessageDto.conversationId}`)
      .emit('message:receive', savedMessage);
  }
}
