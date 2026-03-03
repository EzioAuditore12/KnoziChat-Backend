import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

import { ChatService } from './services/chat.service';
import type { AuthenticatedSocket } from 'src/auth/types/auth-jwt-payload';
import { InsertOneToOneChatDto } from './dto/one-to-one/chats-one-to-one/insert-one-to-one-chat.dto';
import { Logger } from '@nestjs/common';

@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  ONLINE_USERS = new Map<string, string>();

  constructor(private readonly chatService: ChatService) {}

  afterInit(server: Server) {
    this.chatService.afterInit(server);
  }

  handleConnection(client: AuthenticatedSocket) {
    this.chatService.handleConnect(client, this.server, this.ONLINE_USERS);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.chatService.handleDisconnect(client, this.server, this.ONLINE_USERS);
  }

  @SubscribeMessage('conversation:join')
  async joinConversation(
    client: AuthenticatedSocket,
    conversationId: string,
  ): Promise<void> {
    await this.chatService.joinConversation(client, conversationId);
  }

  @SubscribeMessage('conversation:leave')
  async leaveConversation(
    client: AuthenticatedSocket,
    conversationId: string,
  ): Promise<void> {
    await this.chatService.leaveConversation(client, conversationId);
  }

  @SubscribeMessage('message:send')
  async sendMessage(
    client: AuthenticatedSocket,
    insertChatDto: Omit<InsertOneToOneChatDto, 'senderId'> & {
      receiverId: string;
    },
  ) {
    const senderId = client.handshake.user.id;

    const savedMessage = await this.chatService.saveMessage({
      senderId,
      ...insertChatDto,
    });

    client.broadcast
      .to(`conversation:${savedMessage.conversationId}`)
      .emit('message:receive', savedMessage);

    this.server
      .to(`user:${insertChatDto.receiverId}`)
      .except(`conversation:${savedMessage.conversationId}`)
      .emit('message:receive', savedMessage);
  }
}
