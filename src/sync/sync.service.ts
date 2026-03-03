import { Injectable } from '@nestjs/common';
import { ChatsOneToOneService } from 'src/chat/services/one-to-one/chats-one-to-one.service';
import { ConversationOneToOneService } from 'src/chat/services/one-to-one/conversation-one-to-one.service';
import { UserService } from 'src/user/user.service';
import { PullChangesRequestDto } from './dto/pull-changes/pull-changes-request.dto';
import { PullChangesResponseDto } from './dto/pull-changes/pull-changes-response.dto';
import {
  ConversationOneToOneSyncChangeDto,
  ConversationOneToOneSyncDto,
} from './dto/conversation-one-to-one-sync.dto';
import { UserSyncChangeDto, UserSyncDto } from './dto/user-sync.dto';
import {
  ChatsOneToOneSyncChangeDto,
  ChatsOneToOneSyncDto,
} from './dto/chats-one-to-one-sync.dto';

@Injectable()
export class SyncService {
  constructor(
    private readonly userService: UserService,
    private readonly conversationOneToOneService: ConversationOneToOneService,
    private readonly chatsOneToOneService: ChatsOneToOneService,
  ) {}

  public async pullChanges(
    userId: string,
    pullChangesRequestDto: PullChangesRequestDto,
  ): Promise<PullChangesResponseDto> {
    const { lastSyncedAt, tableNames } = pullChangesRequestDto;

    const timestamp = new Date(lastSyncedAt);

    const { contactIds, conversationIds } =
      await this.conversationOneToOneService.findAllUserConversationsAndContacts(
        userId,
      );

    const conversationOneToOneChanges =
      await this.pullOneToOneConversationChanges(userId, timestamp);

    const involvedUserIds = this.findAllInvolvedUserIds(
      conversationOneToOneChanges,
    );

    const userChanges = await this.pullUserChanges(contactIds, timestamp);

    await this.addMissingUserDetails(userChanges, involvedUserIds);

    const chatsOneToOneChanges = await this.pullOneToOneChatsChanges(
      userId,
      conversationIds,
      timestamp,
    );

    return {
      timestamp: Date.now(),
      changes: {
        user: userChanges,
        conversationOneToOne: conversationOneToOneChanges,
        chatsOneToOne: chatsOneToOneChanges,
      },
    };
  }

  private async pullOneToOneConversationChanges(
    userId: string,
    timestamp: Date,
  ): Promise<ConversationOneToOneSyncChangeDto> {
    const conversations =
      await this.conversationOneToOneService.findConversationsContainingUser(
        userId,
        timestamp,
      );

    const mappedConversations = conversations.map((c) => {
      const { participants, ...rest } = c;
      return {
        ...rest,
        userId: participants.find((id) => id !== userId) as string,
        createdAt: c.createdAt.getTime(),
        updatedAt: c.updatedAt.getTime(),
      };
    });

    return {
      created: mappedConversations.filter(
        (c) => c.createdAt > timestamp.getTime(),
      ),
      updated: mappedConversations.filter(
        (c) =>
          c.createdAt <= timestamp.getTime() &&
          c.updatedAt > timestamp.getTime(),
      ),
      deleted: [],
    };
  }

  private async addMissingUserDetails(
    userChanges: UserSyncChangeDto,
    involvedUserIds: Set<string>,
  ): Promise<void> {
    const syncedUserIds = new Set<string>([
      ...userChanges.created.map((u) => u.id),
      ...userChanges.updated.map((u) => u.id),
    ]);

    const missingUserIds = Array.from(involvedUserIds).filter(
      (id) => !syncedUserIds.has(id),
    );

    if (missingUserIds.length > 0) {
      const missingUsersDto = await this.pullUserChanges(
        missingUserIds,
        new Date(0),
      );
      userChanges.created.push(...missingUsersDto.created);
    }
  }

  private async pullUserChanges(
    userIds: string[],
    timestamp: Date,
  ): Promise<UserSyncChangeDto> {
    const users = await this.userService.findUsersWithChanges(
      userIds,
      timestamp,
    );

    const mappedUsers = users.map((u) => ({
      ...u,
      createdAt: u.createdAt.getTime(),
      updatedAt: u.updatedAt.getTime(),
    }));

    return {
      created: mappedUsers.filter((u) => u.createdAt > timestamp.getTime()),
      updated: mappedUsers.filter(
        (u) =>
          u.createdAt <= timestamp.getTime() &&
          u.updatedAt > timestamp.getTime(),
      ),
      deleted: [],
    };
  }

  private async pullOneToOneChatsChanges(
    userId: string,
    conversationIds: string[],
    timestamp: Date,
  ): Promise<ChatsOneToOneSyncChangeDto> {
    const chats =
      await this.chatsOneToOneService.findChatsSinceForConversations(
        conversationIds,
        timestamp,
      );

    const mappedChats: ChatsOneToOneSyncDto[] = chats.map((c) => {
      const { createdAt, updatedAt, senderId, ...rest } = c;

      return {
        ...rest,
        mode: senderId === userId ? 'SENT' : 'RECEIVED',
        createdAt: createdAt.getTime(),
        updatedAt: updatedAt.getTime(),
      };
    });

    return {
      created: mappedChats.filter((d) => d.createdAt > timestamp.getTime()),
      updated: mappedChats.filter(
        (d) =>
          d.createdAt <= timestamp.getTime() &&
          d.updatedAt > timestamp.getTime(),
      ),
      deleted: [],
    };
  }

  private findAllInvolvedUserIds(
    conversationChanges: ConversationOneToOneSyncChangeDto,
  ): Set<string> {
    const involvedUserIds = new Set<string>();
    const collectUserIds = (c: ConversationOneToOneSyncDto) => {
      if (c.userId) involvedUserIds.add(c.userId);
    };

    conversationChanges.created.forEach(collectUserIds);
    conversationChanges.updated.forEach(collectUserIds);

    return involvedUserIds;
  }
}
