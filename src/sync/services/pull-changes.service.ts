import { Injectable } from '@nestjs/common';

import { UserService } from 'src/user/user.service';
import { UsersChangeDto } from '../dto/changes/users-change.dto';
import { ConversationsChangeDto } from '../dto/changes/conversations-change.dto';
import { DirectChatsChangeDto } from '../dto/changes/direct-chats-change.dto';
import { PullChangesResponseDto } from '../dto/pull-changes/pull-changes-response.dto';
import { PullChangesRequestDto } from '../dto/pull-changes/pull-changes-request.dto';
import { DirectChatService } from 'src/chat/services/direct-chat.service';
import { PublicUserDto } from 'src/user/dto/public-user.dto';
import { UserSyncDto } from '../dto/user-sync.dto';
import { ConversationDto } from 'src/chat/dto/conversation.dto';
import { ConversationSyncDto } from '../dto/conversation-sync.dto';
import { DirectChatDto } from 'src/chat/dto/direct-chat/direct-chat.dto';
import { DirectChatSyncDto } from '../dto/direct-chat-sync.dto';
import { ConversationService } from 'src/chat/services/conversation.service';

@Injectable()
export class PullChangeService {
  constructor(
    private readonly userService: UserService,
    private readonly conversationService: ConversationService,
    private readonly directChatService: DirectChatService,
  ) {}

  async pullChanges(
    userId: string,
    pullChangesRequestDto: PullChangesRequestDto,
  ): Promise<PullChangesResponseDto> {
    const { lastSyncAt, tables } = pullChangesRequestDto;

    const timestamp = new Date(lastSyncAt);

    const { contactIds, conversationIds } =
      await this.conversationService.findAllUserConversationsAndContacts(
        userId,
      );

    const userChanges = await this.pullUserChanges(contactIds, timestamp);

    const conversationChanges = await this.pullConversationChanges(
      userId,
      timestamp,
    );

    const directChatChanges = await this.pullDirectChatChanges(
      userId,
      conversationIds,
      timestamp,
    );

    return {
      changes: {
        users: userChanges,
        conversations: conversationChanges,
        direct_chats: directChatChanges,
      },
      timestamp: Date.now(),
    };
  }

  private async pullUserChanges(
    userIds: string[],
    timestamp: Date,
  ): Promise<UsersChangeDto> {
    const users = await this.userService.findUsersWithChanges(
      userIds,
      timestamp,
    );

    const mappedUsersArray = users.map(this.mapToUserSyncDto);

    return {
      created: mappedUsersArray.filter(
        (u) => u.created_at > timestamp.getTime(),
      ),
      updated: mappedUsersArray.filter(
        (u) =>
          u.created_at <= timestamp.getTime() &&
          u.updated_at > timestamp.getTime(),
      ),
      deleted: [],
    };
  }

  private async pullConversationChanges(
    userId: string,
    timestamp: Date,
  ): Promise<ConversationsChangeDto> {
    const conversations =
      await this.conversationService.findConversationsContainingUser(
        userId,
        timestamp,
      );

    const mappedConversationsArray = conversations.map((conversation) =>
      this.mapToConversationSyncDto(userId, conversation),
    );

    return {
      created: mappedConversationsArray.filter(
        (c) => c.created_at > timestamp.getTime(),
      ),
      updated: mappedConversationsArray.filter(
        (c) =>
          c.created_at <= timestamp.getTime() &&
          c.updated_at > timestamp.getTime(),
      ),
      deleted: [],
    };
  }

  private async pullDirectChatChanges(
    userId: string,
    conversationIds: string[],
    timestamp: Date,
  ): Promise<DirectChatsChangeDto> {
    const directChats =
      await this.directChatService.findChatsSinceForConversations(
        conversationIds,
        timestamp,
      );

    const mappedDirectChatsArray = directChats.map((directChat) =>
      this.mapToDirectChatSyncDto(userId, directChat),
    );

    return {
      created: mappedDirectChatsArray.filter(
        (d) => d.created_at > timestamp.getTime(),
      ),
      updated: mappedDirectChatsArray.filter(
        (d) =>
          d.created_at <= timestamp.getTime() &&
          d.updated_at > timestamp.getTime(),
      ),
      deleted: [],
    };
  }

  private mapToUserSyncDto(user: PublicUserDto): UserSyncDto {
    return {
      id: user.id,
      phone_number: user.phoneNumber,
      first_name: user.firstName,
      middle_name: user.middleName ?? null,
      last_name: user.lastName,
      avatar: user.avatar ?? null,
      email: user.email ?? null,
      created_at: user.createdAt.getTime(),
      updated_at: user.updatedAt.getTime(),
    };
  }

  private mapToConversationSyncDto(
    userId: string,
    conversation: ConversationDto,
  ): ConversationSyncDto {
    return {
      id: conversation._id.toHexString(),
      user_id: conversation.participants.find(
        (p: string) => p !== userId,
      ) as string,
      created_at: conversation.createdAt.getTime(),
      updated_at: conversation.updatedAt.getTime(),
    };
  }

  private mapToDirectChatSyncDto(
    userId: string,
    directChat: DirectChatDto,
  ): DirectChatSyncDto {
    return {
      id: directChat._id.toHexString(),
      conversation_id: directChat.conversationId.toHexString(),
      mode: directChat.senderId === userId ? 'SENT' : 'RECEIVED',
      text: directChat.text,
      is_delivered: directChat.delivered,
      is_seen: directChat.seen,
      created_at: directChat.createdAt.getTime(),
      updated_at: directChat.updatedAt.getTime(),
    };
  }
}
