import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';

import { ChatService } from './services/chat.service';
import type { AuthenticatedSocket } from 'src/auth/types/auth-jwt-payload';
import { InsertOneToOneChatDto } from './dto/one-to-one/chats-one-to-one/insert-one-to-one-chat.dto';

import { InsertGroupChatDto } from './dto/group/chats-group/insert-group-chat.dto';
import { InsertGroupChatContentDto } from './dto/group/chats-group/insert-group-chat-content.dto';

@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  ONLINE_USERS = new Map<string, string>();

  constructor(
    private readonly chatService: ChatService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  afterInit(server: Server) {
    this.chatService.afterInit(server);
  }

  handleConnection(client: AuthenticatedSocket) {
    this.chatService.handleConnect(client, this.server, this.cacheManager);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.chatService.handleDisconnect(client, this.server, this.cacheManager);
  }

  @SubscribeMessage('presence:get')
  async getPresence(client: AuthenticatedSocket, userIds: string[]) {
    const statuses = await Promise.all(
      userIds.map(async (userId) => {
        const sockets = await this.cacheManager.get<string[]>(
          `online:${userId}`,
        );

        client.join(`presence:${userId}`);

        return {
          userId,
          online: !!sockets?.length,
        };
      }),
    );

    client.emit('presence:list', statuses);
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
    insertChatDto: Omit<InsertOneToOneChatDto, 'senderId' | 'status'> & {
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

    return {
      success: true,
      messageId: savedMessage.id,
    };
  }

  @SubscribeMessage('message:seen')
  async markSeen(
    client: AuthenticatedSocket,
    payload: {
      conversationId: string;
    },
  ) {
    const userId = client.handshake.user.id;

    // 1. Get the new watermark from the service layer
    const { lastSeenAt } = await this.chatService.markConversationMessagesSeen(
      payload.conversationId,
      userId,
    );

    // 2. Broadcast the watermark update to everyone currently in the conversation room
    this.server
      .to(`conversation:${payload.conversationId}`)
      .emit('message:seen:update', {
        conversationId: payload.conversationId,
        userId,
        lastSeenAt, // Broadcast the datetime instead of messageIds
      });

    // 3. (Optional but recommended) If you need the other user to get the update
    // even if they don't currently have the chat window open (e.g. to update the home screen list):
    // Note: Since we don't have exactly who the other user is directly from this payload anymore,
    // you might need to rely on the Sync API to update them when they open the app,
    // OR fetch the conversation participants to send to their specific user channel.
    // For now, emitting to the conversation room handles active watchers.
  }

  @SubscribeMessage('conversation-group:join')
  async joinGroupConversation(
    client: AuthenticatedSocket,
    conversationId: string,
  ): Promise<void> {
    await this.chatService.joinGroupConversation(client, conversationId);
  }

  @SubscribeMessage('conversation-group:leave')
  async leaveGroupConversation(
    client: AuthenticatedSocket,
    conversationId: string,
  ): Promise<void> {
    await this.chatService.leaveGroupConversation(client, conversationId);
  }

  @SubscribeMessage('message-group:send')
  async sendGroupMessage(
    client: AuthenticatedSocket,
    insertGroupChatContentDto: Omit<InsertGroupChatContentDto, 'senderId'>,
  ) {
    const senderId = client.handshake.user.id;

    const savedMessage = await this.chatService.saveGroupMessage({
      senderId,
      ...insertGroupChatContentDto,
    });

    client.broadcast
      .to(`conversation-group:${savedMessage.conversationId}`)
      .emit('message-group:receive', savedMessage);

    const conversationId = insertGroupChatContentDto.conversationId;

    const participants =
      await this.chatService.getGroupParticipantIds(conversationId);

    const participantRooms = participants
      .filter((id) => id !== senderId)
      .map((id) => `user:${id}`);

    if (participantRooms.length > 0) {
      this.server
        .to(participantRooms)
        .except(`conversation-group:${savedMessage.conversationId}`)
        .emit('message-group:receive', savedMessage);
    }

    return {
      success: true,
      messageId: savedMessage.id,
    };
  }

  @SubscribeMessage('conversation:typing')
  async handleTyping(
    client: AuthenticatedSocket,
    payload: { conversationId: string; isTyping: boolean },
  ) {
    const senderId = client.handshake.user.id;

    client.broadcast
      .to(`conversation:${payload.conversationId}`)
      .emit('typing', { senderId, isTyping: payload.isTyping });
  }

  @SubscribeMessage('conversation-group:typing')
  async handleGroupTyping(
    client: AuthenticatedSocket,
    payload: { conversationId: string; isTyping: boolean },
  ) {
    const senderId = client.handshake.user.id;

    client.broadcast
      .to(`conversation-group:${payload.conversationId}`)
      .emit('typing:group', { senderId, isTyping: payload.isTyping });
  }
}
