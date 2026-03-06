import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

import { ChatsOneToOneService } from './one-to-one/chats-one-to-one.service';
import { WSAuthMiddleware } from 'src/auth/middlewares/ws-auth.middleware';
import { AuthenticatedSocket } from 'src/auth/types/auth-jwt-payload';
import { InsertOneToOneChatDto } from '../dto/one-to-one/chats-one-to-one/insert-one-to-one-chat.dto';
import { ChatsOneToOneDto } from '../dto/one-to-one/chats-one-to-one/chats-one-to-one.dto';
import { ChatsGroupService } from './group/chats-group.service';
import { InsertGroupChatDto } from '../dto/group/chats-group/insert-group-chat.dto';
import { ChatsGroupDto } from '../dto/group/chats-group/chats-group.dto';
import { ConversationGroupService } from './group/conversation-group.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatsOneToOneService: ChatsOneToOneService,
    private readonly chatsGroupService: ChatsGroupService,
    private readonly conversationGroupService: ConversationGroupService,
    private readonly jwtService: JwtService,
  ) {}

  public afterInit(server: Server): void {
    const wsAuthMiddleware = WSAuthMiddleware(this.jwtService);

    server.use(wsAuthMiddleware);
  }

  public handleConnect(
    client: AuthenticatedSocket,
    server: Server,
    onlineUsers: Map<string, string>,
  ): void {
    const userId = client.handshake.user.id;

    if (!userId) {
      client.disconnect();
      return;
    }

    Logger.log('User connected', userId);

    onlineUsers.set(userId, client.id);

    client.join(`user:${userId}`);

    server.emit('online:users', Array.from(onlineUsers.keys()));
  }

  public handleDisconnect(
    client: AuthenticatedSocket,
    server: Server,
    onlineUsers: Map<string, string>,
  ) {
    const userId = client.handshake.user.id;

    const newSocketId = client.id;

    if (userId && onlineUsers.get(userId) === newSocketId) {
      onlineUsers.delete(userId);

      server.emit('online:users', Array.from(onlineUsers.keys()));

      Logger.log('Disconnected', userId);

      client.disconnect();

      return;
    }
  }

  public async joinConversation(
    client: AuthenticatedSocket,
    conversationId: string,
  ) {
    const userId = client.handshake.user.id;

    Logger.log(`${userId} joining the room ${conversationId}`);

    await client.join(`conversation:${conversationId}`);
  }

  public async leaveConversation(
    client: AuthenticatedSocket,
    conversationId: string,
  ) {
    const userId = client.handshake.user.id;

    Logger.log(`${userId} leaving the room ${conversationId}`);

    await client.leave(`conversation:${conversationId}`);
  }

  public async saveMessage(
    insertOneToOneChatDto: InsertOneToOneChatDto,
  ): Promise<ChatsOneToOneDto> {
    return await this.chatsOneToOneService.insert(insertOneToOneChatDto);
  }

  public async joinGroupConversation(
    client: AuthenticatedSocket,
    conversationId: string,
  ) {
    const userId = client.handshake.user.id;

    Logger.log(`${userId} joining the group room ${conversationId}`);

    await client.join(`conversation-group:${conversationId}`);
  }

  public async leaveGroupConversation(
    client: AuthenticatedSocket,
    conversationId: string,
  ) {
    const userId = client.handshake.user.id;

    Logger.log(`${userId} leaving the room ${conversationId}`);

    await client.leave(`conversation-group:${conversationId}`);
  }

  public async saveGroupMessage(
    insertGroupChatDto: InsertGroupChatDto,
  ): Promise<ChatsGroupDto> {
    return await this.chatsGroupService.insert(insertGroupChatDto);
  }

  public async getGroupParticipantIds(groupId: string): Promise<string[]> {
    return await this.conversationGroupService.getParticipantIds(
      BigInt(groupId),
    );
  }
}
