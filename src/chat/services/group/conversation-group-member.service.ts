import {
  ForbiddenException,
  Injectable,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model } from 'mongoose';
import {
  ConversationGroupMemberDto,
  convertConversationGroupMemberSchemaFromMongoose,
} from 'src/chat/dto/group/conversation-group/conversation-group-member.dto';
import { ChatsGroupDto } from 'src/chat/dto/group/chats-group/chats-group.dto';
import {
  InsertConversationGroupMemberDto,
  insertConversationGroupMemberSchemaForMonoose,
} from 'src/chat/dto/group/conversation-group/insert-group-member.dto';
import {
  ConversationGroupMember,
  ConversationGroupMemberDocument,
} from 'src/chat/entities/group/conversation-group-members.entity';
import { ChatsGroupService } from './chats-group.service';

@Injectable()
export class ConversationGroupMemberService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,

    @InjectModel(ConversationGroupMember.name)
    private readonly conversationGroupMemberModel: Model<ConversationGroupMemberDocument>,
    @Inject(forwardRef(() => ChatsGroupService))
    private readonly chatsGroupService: ChatsGroupService,
  ) {}

  public async insertGroupParticipants(
    groupId: bigint,
    participantIds: string[],
    adminIds: string[],
    joinedAt?: Date,
    session?: ClientSession,
  ): Promise<void> {
    const adminSet = new Set(adminIds);

    const mappedMembers: InsertConversationGroupMemberDto[] =
      participantIds.map((userId) => ({
        id: `${groupId.toString()}:${userId}`,

        groupId: groupId.toString(),

        userId,

        isAdmin: adminSet.has(userId),

        createdAt: joinedAt ?? new Date(),
      }));

    const mappedIntoMongoose = insertConversationGroupMemberSchemaForMonoose
      .array()
      .parse(mappedMembers);

    await this.conversationGroupMemberModel.bulkWrite(
      mappedIntoMongoose.map((member) => ({
        updateOne: {
          filter: {
            _id: member._id,
          },

          update: {
            $setOnInsert: member,
          },

          upsert: true,
        },
      })),
      { session },
    );
  }

  public async getParticipantIds(conversationId: bigint): Promise<string[]> {
    const participants = await this.conversationGroupMemberModel.find({
      groupId: conversationId,

      deletedAt: null,
    });

    return participants.map((p) => p.userId);
  }

  public async getMembers(id: bigint): Promise<ConversationGroupMemberDto[]> {
    const members = await this.conversationGroupMemberModel.find({
      groupId: id,
    });

    return convertConversationGroupMemberSchemaFromMongoose
      .array()
      .parse(members);
  }

  public async isExistingMember(id: bigint, userId: string) {
    const memberId = `${id.toString()}:${userId}`;

    const isMember = await this.conversationGroupMemberModel.exists({
      _id: memberId,
      deletedAt: null,
    });

    return !!isMember;
  }

  private async findActiveMember(
    groupId: bigint,
    userId: string,
    session: ClientSession,
  ): Promise<ConversationGroupMemberDto> {
    const memberId = `${groupId.toString()}:${userId}`;

    const member = await this.conversationGroupMemberModel.findOne(
      {
        _id: memberId,
        deletedAt: null,
      },
      null,
      { session },
    );

    if (!member) {
      throw new ForbiddenException('Member does not exist');
    }

    return convertConversationGroupMemberSchemaFromMongoose.parse(member);
  }

  public async leaveConversation(
    id: bigint,
    userId: string,
  ): Promise<{
    deletedAt: Date;
    newAdminId?: string;
    memberLeftChat: ChatsGroupDto;
    adminChangedChat?: ChatsGroupDto;
  }> {
    const session = await this.connection.startSession();

    session.startTransaction();

    try {
      const member = await this.findActiveMember(id, userId, session);

      const deletedAt = new Date();

      let newAdminId: string | undefined;
      let adminChangedChat: ChatsGroupDto | undefined;

      /**
       * Transfer admin
       */
      if (member.isAdmin) {
        const result = await this.reassignAdminIfNeeded(id, userId, session);
        newAdminId = result.newAdminId;
        adminChangedChat = result.adminChangedChat;
      }

      /**
       * Soft leave
       */
      await this.softLeaveMember(id, userId, deletedAt, session);

      /**
       * Timeline event
       */
      const memberLeftChat = await this.insertMemberLeftEvent(
        id,
        userId,
        session,
      );

      await session.commitTransaction();

      return {
        deletedAt,
        newAdminId,
        memberLeftChat,
        adminChangedChat,
      };
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }

      throw error;
    } finally {
      await session.endSession();
    }
  }

  public async findAllUserConversationsAndContacts(
    userId: string,
  ): Promise<{ conversationIds: string[]; contactIds: string[] }> {
    const memberships = await this.conversationGroupMemberModel.find({
      userId,
    });

    const conversationIds = memberships.map((m) => m.groupId.toString());

    const allGroupMembers = await this.conversationGroupMemberModel.find({
      groupId: {
        $in: memberships.map((m) => m.groupId),
      },
    });

    const contactIds = new Set<string>();

    allGroupMembers.forEach((member) => {
      if (member.userId !== userId) {
        contactIds.add(member.userId);
      }
    });

    return {
      conversationIds,
      contactIds: Array.from(contactIds),
    };
  }

  public async findMembershipsForConversations(
    conversationIds: bigint[],
  ): Promise<ConversationGroupMemberDto[]> {
    const memberships = await this.conversationGroupMemberModel.find({
      groupId: {
        $in: conversationIds,
      },
    });

    return convertConversationGroupMemberSchemaFromMongoose
      .array()
      .parse(memberships);
  }

  public async findUserMemberShipInGroups(userId: string): Promise<bigint[]> {
    const memberships = await this.conversationGroupMemberModel.find({
      userId,
    });

    const groupIds = memberships.map((m) => BigInt(m.groupId));

    return groupIds;
  }

  private async reassignAdminIfNeeded(
    groupId: bigint,
    currentUserId: string,
    session: ClientSession,
  ): Promise<{ newAdminId?: string; adminChangedChat?: ChatsGroupDto }> {
    const eligibleMembers = await this.conversationGroupMemberModel.find(
      {
        groupId,
        deletedAt: null,
        userId: {
          $ne: currentUserId,
        },
      },
      null,
      { session },
    );

    if (eligibleMembers.length === 0) {
      return {};
    }

    const randomMember =
      eligibleMembers[Math.floor(Math.random() * eligibleMembers.length)];

    await this.conversationGroupMemberModel.updateOne(
      {
        _id: randomMember._id,
      },
      {
        $set: {
          isAdmin: true,
        },
      },
      { session },
    );

    const adminChangedChat = await this.chatsGroupService.insertSystemEvent(
      {
        conversationId: groupId.toString(),

        contentType: 'system',

        senderId: randomMember.userId,

        systemEventType: 'admin_changed',

        metadata: {
          newAdminId: randomMember.userId,
        },
      },
      session,
    );

    return {
      newAdminId: randomMember.userId,
      adminChangedChat,
    };
  }

  private async softLeaveMember(
    groupId: bigint,
    userId: string,
    deletedAt: Date,
    session: ClientSession,
  ): Promise<void> {
    const memberId = `${groupId.toString()}:${userId}`;

    await this.conversationGroupMemberModel.updateOne(
      {
        _id: memberId,
      },
      {
        $set: {
          deletedAt,
          isAdmin: false,
        },
      },
      { session },
    );
  }

  private async insertMemberLeftEvent(
    groupId: bigint,
    userId: string,
    session: ClientSession,
  ): Promise<ChatsGroupDto> {
    return this.chatsGroupService.insertSystemEvent(
      {
        conversationId: groupId.toString(),

        contentType: 'system',

        senderId: userId,

        systemEventType: 'member_left',

        metadata: {
          affectedUserId: userId,
        },
      },
      session,
    );
  }
}
