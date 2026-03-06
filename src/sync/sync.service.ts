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
import { UserSyncChangeDto } from './dto/user-sync.dto';
import {
  ChatsOneToOneSyncChangeDto,
  ChatsOneToOneSyncDto,
} from './dto/chats-one-to-one-sync.dto';
import { ConversationGroupService } from 'src/chat/services/group/conversation-group.service';
import { ChatsGroupService } from 'src/chat/services/group/chats-group.service';
import {
  ChatsGroupSyncChangeDto,
  ChatsGroupSyncDto,
} from './dto/chats-group-sync.dto';
import {
  ConversationGroupSyncChangeDto,
  ConversationGroupSyncDto,
} from './dto/conversation-group-sync.shema';

@Injectable()
export class SyncService {
  constructor(
    private readonly userService: UserService,
    private readonly conversationOneToOneService: ConversationOneToOneService,
    private readonly chatsOneToOneService: ChatsOneToOneService,
    private readonly conversationGroupService: ConversationGroupService,
    private readonly chatsGroupService: ChatsGroupService,
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

    const {
      contactIds: groupParticipantIds,
      conversationIds: groupConversationIds,
    } =
      await this.conversationGroupService.findAllUserConversationsAndContacts(
        userId,
      );

    const conversationOneToOneChanges =
      await this.pullOneToOneConversationChanges(userId, timestamp);

    const conversationGroupChanges = await this.pullGroupConversationChanges(
      userId,
      timestamp,
    );

    const involvedUserIds = this.findAllInvolvedUserIds(
      conversationOneToOneChanges,
      conversationGroupChanges,
    );

    // Combine 1-to-1 contacts and group participants
    const allKnownContactIds = Array.from(
      new Set([...contactIds, ...groupParticipantIds]),
    );

    const userChanges = await this.pullUserChanges(
      allKnownContactIds,
      timestamp,
    );

    await this.addMissingUserDetails(userChanges, involvedUserIds);

    const chatsOneToOneChanges = await this.pullOneToOneChatsChanges(
      userId,
      conversationIds,
      timestamp,
    );

    const chatsGroupChanges = await this.pullGroupChatsChanges(
      groupConversationIds,
      timestamp,
    );

    return {
      timestamp: Date.now(),
      changes: {
        user: userChanges,
        conversationOneToOne: conversationOneToOneChanges,
        conversationGroup: conversationGroupChanges,
        chatsOneToOne: chatsOneToOneChanges,
        chatsGroup: chatsGroupChanges,
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

    const mappedConversations: ConversationOneToOneSyncDto[] =
      conversations.map((c) => {
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

  private async pullGroupConversationChanges(
    userId: string,
    timestamp: Date,
  ): Promise<ConversationGroupSyncChangeDto> {
    const conversations =
      await this.conversationGroupService.findConversationsContainingUser(
        userId,
        timestamp,
      );

    const mappedConversations: ConversationGroupSyncDto[] = conversations.map(
      (c) => {
        const { createdAt, updatedAt, participants, admins, ...rest } = c;
        return {
          ...rest,
          participantIds: participants,
          adminIds: admins,
          createdAt: createdAt.getTime(),
          updatedAt: updatedAt.getTime(),
        };
      },
    );

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

  private async pullGroupChatsChanges(
    conversationIds: string[],
    timestamp: Date,
  ): Promise<ChatsGroupSyncChangeDto> {
    const chats = await this.chatsGroupService.findChatsSinceForConversations(
      conversationIds,
      timestamp,
    );

    const mappedChats: ChatsGroupSyncDto[] = chats.map((c) => {
      const { createdAt, updatedAt, ...rest } = c;

      return {
        ...rest,
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
    conversationOneToOneChanges: ConversationOneToOneSyncChangeDto,
    conversationGroupChanges: ConversationGroupSyncChangeDto,
  ): Set<string> {
    const involvedUserIds = new Set<string>();

    const collectOneToOneUserIds = (c: ConversationOneToOneSyncDto) => {
      if (c.userId) involvedUserIds.add(c.userId);
    };

    const collectGroupUserIds = (c: ConversationGroupSyncDto) => {
      c.participantIds?.forEach((id) => involvedUserIds.add(id));
      c.adminIds?.forEach((id) => involvedUserIds.add(id));
    };

    conversationOneToOneChanges.created.forEach(collectOneToOneUserIds);
    conversationOneToOneChanges.updated.forEach(collectOneToOneUserIds);

    conversationGroupChanges.created.forEach(collectGroupUserIds);
    conversationGroupChanges.updated.forEach(collectGroupUserIds);

    return involvedUserIds;
  }
}
