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
import {
  ChatsAttachmentSyncChangeDto,
  ChatsAttachmentSyncDto,
} from './dto/chat-attachment-sync.dto';
import {
  ConversationGroupMemberSyncChangeDto,
  ConversationGroupMemberSyncDto,
} from './dto/conversation-group-member-sync.dto';
import { ConversationGroupMemberService } from 'src/chat/services/group/conversation-group-member.service';

@Injectable()
export class SyncService {
  constructor(
    private readonly userService: UserService,

    private readonly conversationOneToOneService: ConversationOneToOneService,
    private readonly chatsOneToOneService: ChatsOneToOneService,

    private readonly conversationGroupService: ConversationGroupService,
    private readonly chatsGroupService: ChatsGroupService,
    private readonly conversationGroupMemberService: ConversationGroupMemberService,
  ) {}

  public async pullChanges(
    userId: string,
    pullChangesRequestDto: PullChangesRequestDto,
  ): Promise<PullChangesResponseDto> {
    const { lastSyncedAt, tableNames } = pullChangesRequestDto;

    const timestamp = new Date(lastSyncedAt);
    const syncCutoff = new Date();

    const { contactIds, conversationIds } =
      await this.conversationOneToOneService.findAllUserConversationsAndContacts(
        userId,
      );

    const {
      contactIds: groupParticipantIds,
      conversationIds: groupConversationIds,
    } =
      await this.conversationGroupMemberService.findAllUserConversationsAndContacts(
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
      groupParticipantIds,
    );

    // Combine 1-to-1 contacts and group participants
    const allKnownContactIds = Array.from(
      new Set([...contactIds, ...groupParticipantIds, userId]),
    );

    const userChanges = await this.pullUserChanges(
      allKnownContactIds,
      timestamp,
    );

    await this.addMissingUserDetails(userChanges, involvedUserIds);

    const { chatsOneToOne, chatOneToOneAttachments } =
      await this.pullOneToOneChatsChanges(userId, conversationIds, timestamp);

    const { chatsGroup, chatsGroupAttachments } =
      await this.pullGroupChatsChanges(groupConversationIds, timestamp);

    const conversationGroupMembers =
      await this.pullConversationGroupMemberChanges(
        groupConversationIds,
        timestamp,
      );

    return {
      timestamp: syncCutoff.getTime(),
      changes: {
        user: userChanges,
        conversationDirect: conversationOneToOneChanges,
        conversationGroup: conversationGroupChanges,
        conversationGroupMembers,
        chatsDirect: chatsOneToOne,
        chatsGroup,
        chatsAttachments: this.mergeAttachmentChanges(
          chatOneToOneAttachments,
          chatsGroupAttachments,
        ),
      },
    };
  }

  private async pullOneToOneConversationChanges(
    userId: string, // the current logged in user asking for sync
    timestamp: Date,
  ): Promise<ConversationOneToOneSyncChangeDto> {
    const conversations =
      await this.conversationOneToOneService.findConversationsContainingUser(
        userId,
        timestamp,
      );

    const created: ConversationOneToOneSyncDto[] = [];
    const updated: ConversationOneToOneSyncDto[] = [];

    for (const c of conversations) {
      const { participants, lastSeenAt, ...rest } = c;
      const otherUserId = participants.find((id) => id !== userId) as string;

      // Extract my read receipt and their read receipt
      let myLastSeenAt = 0;
      let theirLastSeenAt = 0;

      if (lastSeenAt) {
        if (lastSeenAt[userId])
          myLastSeenAt = new Date(lastSeenAt[userId]).getTime();
        if (lastSeenAt[otherUserId])
          theirLastSeenAt = new Date(lastSeenAt[otherUserId]).getTime();
      }

      const mappedConversation: ConversationOneToOneSyncDto = {
        ...rest,
        userId: otherUserId,
        myLastSeenAt,
        theirLastSeenAt,
        createdAt: c.createdAt.getTime(),
        updatedAt: c.updatedAt.getTime(),
      };

      if (mappedConversation.createdAt > timestamp.getTime()) {
        created.push(mappedConversation);
      } else if (mappedConversation.updatedAt > timestamp.getTime()) {
        updated.push(mappedConversation);
      }
    }

    return { created, updated, deleted: [] };
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

    const created: ConversationGroupSyncDto[] = [];
    const updated: ConversationGroupSyncDto[] = [];

    for (const c of conversations) {
      const { createdAt, updatedAt, ...rest } = c;

      const mappedConversation: ConversationGroupSyncDto = {
        ...rest,
        createdAt: createdAt.getTime(),
        updatedAt: updatedAt.getTime(),
      };

      if (mappedConversation.createdAt > timestamp.getTime()) {
        created.push(mappedConversation);
      } else if (mappedConversation.updatedAt > timestamp.getTime()) {
        updated.push(mappedConversation);
      }
    }

    return { created, updated, deleted: [] };
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

    const created: UserSyncDto[] = [];
    const updated: UserSyncDto[] = [];

    for (const u of users) {
      const mappedUser = {
        ...u,
        createdAt: u.createdAt.getTime(),
        updatedAt: u.updatedAt.getTime(),
      };

      if (mappedUser.createdAt > timestamp.getTime()) {
        created.push(mappedUser);
      } else if (mappedUser.updatedAt > timestamp.getTime()) {
        updated.push(mappedUser);
      }
    }

    return { created, updated, deleted: [] };
  }

  private async pullOneToOneChatsChanges(
    userId: string,
    conversationIds: string[],
    timestamp: Date,
  ): Promise<{
    chatsOneToOne: ChatsOneToOneSyncChangeDto;
    chatOneToOneAttachments: ChatsAttachmentSyncChangeDto;
  }> {
    const chats =
      await this.chatsOneToOneService.findChatsSinceForConversations(
        conversationIds,
        timestamp,
      );

    const createdChats: ChatsOneToOneSyncDto[] = [];
    const updatedChats: ChatsOneToOneSyncDto[] = [];

    const createdAttachments: ChatsAttachmentSyncDto[] = [];
    const updatedAttachments: ChatsAttachmentSyncDto[] = [];

    for (const c of chats) {
      const {
        createdAt,
        updatedAt,
        senderId,
        deletedAt,
        attachmentUrl,
        id,
        ...rest
      } = c;

      const mappedChat: ChatsOneToOneSyncDto = {
        ...rest,
        id,
        mode: senderId === userId ? 'SENT' : 'RECEIVED',
        deletedAt: deletedAt ? deletedAt.getTime() : null,
        createdAt: createdAt.getTime(),
        updatedAt: updatedAt.getTime(),
      };

      const isCreated = createdAt.getTime() > timestamp.getTime();

      if (isCreated) {
        createdChats.push(mappedChat);

        if (attachmentUrl) {
          createdAttachments.push({
            id,
            remoteUrl: attachmentUrl,
          });
        }
      } else if (updatedAt.getTime() > timestamp.getTime()) {
        updatedChats.push(mappedChat);

        if (attachmentUrl) {
          updatedAttachments.push({
            id,
            remoteUrl: attachmentUrl,
          });
        }
      }
    }

    return {
      chatsOneToOne: {
        created: createdChats,
        updated: updatedChats,
        deleted: [],
      },
      chatOneToOneAttachments: {
        created: createdAttachments,
        updated: updatedAttachments,
        deleted: [],
      },
    };
  }

  private async pullGroupChatsChanges(
    conversationIds: string[],
    timestamp: Date,
  ): Promise<{
    chatsGroup: ChatsGroupSyncChangeDto;
    chatsGroupAttachments: ChatsAttachmentSyncChangeDto;
  }> {
    const chats = await this.chatsGroupService.findChatsSinceForConversations(
      conversationIds,
      timestamp,
    );

    const createdChats: ChatsGroupSyncDto[] = [];
    const updatedChats: ChatsGroupSyncDto[] = [];

    const createdAttachments: ChatsAttachmentSyncDto[] = [];
    const updatedAttachments: ChatsAttachmentSyncDto[] = [];

    for (const c of chats) {
      const { createdAt, updatedAt, deletedAt, attachmentUrl, id, ...rest } = c;

      const mappedChat: ChatsGroupSyncDto = {
        ...rest,
        id,
        deletedAt: deletedAt ? deletedAt.getTime() : null,
        createdAt: createdAt.getTime(),
        updatedAt: updatedAt.getTime(),
      };

      const isCreated = createdAt.getTime() > timestamp.getTime();

      if (isCreated) {
        createdChats.push(mappedChat);

        if (attachmentUrl) {
          createdAttachments.push({
            id,
            remoteUrl: attachmentUrl,
          });
        }
      } else if (updatedAt.getTime() > timestamp.getTime()) {
        updatedChats.push(mappedChat);

        if (attachmentUrl) {
          updatedAttachments.push({
            id,
            remoteUrl: attachmentUrl,
          });
        }
      }
    }

    return {
      chatsGroup: {
        created: createdChats,
        updated: updatedChats,
        deleted: [],
      },

      chatsGroupAttachments: {
        created: createdAttachments,
        updated: updatedAttachments,
        deleted: [],
      },
    };
  }

  private async pullConversationGroupMemberChanges(
    conversationIds: string[],
    timestamp: Date,
  ): Promise<ConversationGroupMemberSyncChangeDto> {
    const memberships =
      await this.conversationGroupMemberService.findMembershipsForConversations(
        conversationIds.map((id) => BigInt(id)),
      );

    const created: ConversationGroupMemberSyncDto[] = [];
    const updated: ConversationGroupMemberSyncDto[] = [];

    for (const m of memberships) {
      const mappedMember: ConversationGroupMemberSyncDto = {
        ...m,
        createdAt: m.createdAt.getTime(),
        updatedAt: m.updatedAt.getTime(),
        deletedAt: m.deletedAt ? m.deletedAt.getTime() : null,
      };

      if (m.createdAt.getTime() > timestamp.getTime()) {
        created.push(mappedMember);
      } else {
        updated.push(mappedMember);
      }
    }

    return { created, updated, deleted: [] };
  }

  private mergeAttachmentChanges(
    attachment1: ChatsAttachmentSyncChangeDto,
    attachment2: ChatsAttachmentSyncChangeDto,
  ): ChatsAttachmentSyncChangeDto {
    return {
      created: [...attachment1.created, ...attachment2.created],

      updated: [...attachment1.updated, ...attachment2.updated],

      deleted: [...attachment1.deleted, ...attachment2.deleted],
    };
  }

  private findAllInvolvedUserIds(
    conversationOneToOneChanges: ConversationOneToOneSyncChangeDto,
    groupParticipantIds: string[],
  ): Set<string> {
    const involvedUserIds = new Set<string>();

    const collectOneToOneUserIds = (c: ConversationOneToOneSyncDto) => {
      if (c.userId) {
        involvedUserIds.add(c.userId);
      }
    };

    conversationOneToOneChanges.created.forEach(collectOneToOneUserIds);

    conversationOneToOneChanges.updated.forEach(collectOneToOneUserIds);

    groupParticipantIds.forEach((id) => involvedUserIds.add(id));

    return involvedUserIds;
  }
}
