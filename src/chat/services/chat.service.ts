import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server } from 'socket.io';

import { WSAuthMiddleware } from 'src/auth/middlewares/ws-auth.middleware';
import type { AuthenticatedSocket } from 'src/auth/types/auth-jwt-payload';
import { DirectChatService } from './direct-chat.service';
import { SendMessageDto } from '../dto/message/send-message.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly directChatService: DirectChatService,
  ) {}

  init(server: Server): void {
    const wsAuthMiddleware = WSAuthMiddleware(this.jwtService);

    server.use(wsAuthMiddleware);
  }

  handleConnect(
    client: AuthenticatedSocket,
  ): { userId: string; socketId: string } | undefined {
    const userId = client.handshake.user.id;

    if (!userId) {
      client.disconnect();
      return;
    }

    return { userId, socketId: client.id };
  }

  async sendMessage(
    client: AuthenticatedSocket,
    sendMessageDto: SendMessageDto,
  ) {
    const userId = client.handshake.user.id;

    const { conversationId, text, createdAt, updatedAt } = sendMessageDto;

    const sentMessage = await this.directChatService.insertChat({
      conversationId,
      senderId: userId,
      delivered: true,
      seen: false,
      text,
      createdAt,
      updatedAt,
    });

    return sentMessage;
  }
}
