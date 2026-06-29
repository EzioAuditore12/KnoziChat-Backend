import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WSAuthMiddleware } from 'apps/auth/middlewares/ws-auth.middleware';
import { AuthenticatedSocket } from 'apps/auth/types/auth-jwt-payload';
import type { Cache } from 'cache-manager';
import { Server } from 'socket.io';

import { ChatsGroupDto } from '../dto/group/chats-group/chats-group.dto';
import { InsertGroupChatContentDto } from '../dto/group/chats-group/insert-group-chat-content.dto';
import { ChatsOneToOneDto } from '../dto/one-to-one/chats-one-to-one/chats-one-to-one.dto';
import { InsertOneToOneChatDto } from '../dto/one-to-one/chats-one-to-one/insert-one-to-one-chat.dto';
import { ChatsGroupService } from './group/chats-group.service';
import { ConversationGroupMemberService } from './group/conversation-group-member.service';
import { ConversationGroupService } from './group/conversation-group.service';
import { ChatsOneToOneService } from './one-to-one/chats-one-to-one.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatsOneToOneService: ChatsOneToOneService,
    private readonly chatsGroupService: ChatsGroupService,
    private readonly conversationGroupService: ConversationGroupService,
    private readonly conversationGroupMemberService: ConversationGroupMemberService,

    private readonly jwtService: JwtService,
  ) {}

  public afterInit(server: Server): void {
    const wsAuthMiddleware = WSAuthMiddleware(this.jwtService);

    server.use(wsAuthMiddleware);
  }

  public async handleConnect(
    client: AuthenticatedSocket,
    server: Server,
    onlineUsers: Cache,
  ): Promise<void> {
    const userId = client.handshake.user.id;

    if (!userId) {
      client.disconnect();
      return;
    }

    Logger.log('User connected', userId);

    const key = `online:${userId}`;

    const sockets = (await onlineUsers.get<string[]>(key)) || [];

    if (!sockets.includes(client.id)) sockets.push(client.id);

    await onlineUsers.set(key, sockets, 0);

    const onlineUsersList =
      (await onlineUsers.get<string[]>('online_users_list')) || [];

    if (!onlineUsersList.includes(userId)) onlineUsersList.push(userId);
    await onlineUsers.set('online_users_list', onlineUsersList, 0);

    client.join(`user:${userId}`);

    server.to(`presence:${userId}`).emit('presence:update', {
      userId,
      online: true,
    });

    const onlineKeys = await this.getOnlineUsers(onlineUsers);

    server.emit('online:users', onlineKeys);
  }

  public async handleDisconnect(
    client: AuthenticatedSocket,
    server: Server,
    onlineUsers: Cache,
  ): Promise<void> {
    const userId = client.handshake.user.id;

    if (!userId) {
      return;
    }

    const key = `online:${userId}`;

    const sockets = (await onlineUsers.get<string[]>(key)) || [];

    const updatedSockets = sockets.filter((id) => id !== client.id);

    if (updatedSockets.length === 0) {
      await onlineUsers.del(key);

      const onlineUsersList =
        (await onlineUsers.get<string[]>('online_users_list')) || [];
      const newOnlineUsersList = onlineUsersList.filter((id) => id !== userId);
      await onlineUsers.set('online_users_list', newOnlineUsersList, 0);

      server.to(`presence:${userId}`).emit('presence:update', {
        userId,
        online: false,
      });

      Logger.log('Disconnected', userId);
    } else {
      await onlineUsers.set(key, updatedSockets, 0);
    }

    const onlineKeys = await this.getOnlineUsers(onlineUsers);

    server.emit('online:users', onlineKeys);

    client.disconnect();
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
    const { createdAt, updatedAt, ...rest } = insertOneToOneChatDto;

    const chat = await this.chatsOneToOneService.insert({ ...rest });

    return chat;
  }

  public async updateMessageStatus(
    id: string,
    status: ChatsOneToOneDto['status'],
  ): Promise<ChatsOneToOneDto> {
    return await this.chatsOneToOneService.findByIdAndUpdateStatus(
      BigInt(id),
      status,
    );
  }

  public async markConversationMessagesSeen(
    conversationId: string,
    userId: string,
  ): Promise<{ conversationId: string; userId: string; lastSeenAt: Date }> {
    return await this.chatsOneToOneService.markConversationMessagesSeen(
      BigInt(conversationId),
      userId,
    );
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
    insertGroupChatContentDto: InsertGroupChatContentDto,
  ): Promise<Omit<ChatsGroupDto, 'createdAt' | 'updatedAt'>> {
    const chat = await this.chatsGroupService.insert(insertGroupChatContentDto);

    return chat;
  }

  public async getGroupParticipantIds(groupId: string): Promise<string[]> {
    return await this.conversationGroupMemberService.getParticipantIds(
      BigInt(groupId),
    );
  }

  private async getOnlineUsers(onlineUsers: Cache): Promise<string[]> {
    return (await onlineUsers.get<string[]>('online_users_list')) || [];
  }
}
