import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection, Model } from 'mongoose';
import {
  ConversationGroupMemberDto,
  convertConversationGroupMemberSchemaFromMongoose,
} from 'src/chat/dto/group/conversation-group/conversation-group-member.dto';
import {
  ConversationGroupDto,
  conversationGroupSchema,
  convertConversationGroupSchemaFromMongoose,
} from 'src/chat/dto/group/conversation-group/conversation-group.dto';
import { CreateConversationGroupResponseDto } from 'src/chat/dto/group/conversation-group/create-conversation/create-conversation-responses.dto';
import { CreateConversationGroupDto } from 'src/chat/dto/group/conversation-group/create-conversation/create-conversation.dto';
import {
  ConversationGroupMember,
  ConversationGroupMemberDocument,
} from 'src/chat/entities/group/conversation-group-members.entity';
import {
  ConversationGroup,
  ConversationGroupDocument,
} from 'src/chat/entities/group/conversation-group.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ConversationGroupService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    @InjectModel(ConversationGroup.name)
    private readonly conversationsGroupModel: Model<ConversationGroupDocument>,
    @InjectModel(ConversationGroupMember.name)
    private readonly conversationGroupMemberModel: Model<ConversationGroupMemberDocument>,

    private readonly userService: UserService,
  ) {}

  public async create(
    creatorId: string,
    createConversationGroupDto: CreateConversationGroupDto,
  ): Promise<CreateConversationGroupResponseDto> {
    const session = await this.connection.startSession();

    session.startTransaction();

    try {
      const { name, avatar, participants } = createConversationGroupDto;

      const areExistingUsers =
        await this.userService.areExistingUsers(participants);

      if (!areExistingUsers) {
        throw new ForbiddenException(
          'Given participants are not registered with us',
        );
      }

      const uniqueParticipants = Array.from(
        new Set([...participants, creatorId]),
      );

      const [conversation] = await this.conversationsGroupModel.create(
        [
          {
            name,
            avatar: avatar ?? null,
          },
        ],
        { session },
      );

      await this.insertGroupParticipants(
        conversation._id,
        uniqueParticipants,
        [creatorId],
        conversation.createdAt,
        session,
      );

      await session.commitTransaction();

      return {
        id: conversation._id.toString(),
        adminIds: [creatorId],
        avatar: conversation.avatar,
        name: conversation.name,
        participantIds: uniqueParticipants,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
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

  private async insertGroupParticipants(
    groupId: bigint,
    participantIds: string[],
    adminIds: string[],
    joinedAt?: Date,
    session?: ClientSession,
  ): Promise<void> {
    const adminSet = new Set(adminIds);

    const mappedMembers: ConversationGroupMember[] = participantIds.map(
      (userId) => ({
        _id: `${groupId.toString()}:${userId}`,

        groupId,

        userId,

        isAdmin: adminSet.has(userId),

        joinedAt: joinedAt ?? new Date(),
      }),
    );

    await this.conversationGroupMemberModel.bulkWrite(
      mappedMembers.map((member) => ({
        updateOne: {
          filter: { _id: member._id },

          update: {
            $setOnInsert: member,
          },

          upsert: true,
        },
      })),
      { session },
    );
  }

  public async get(id: bigint): Promise<ConversationGroupDto> {
    const conversation = await this.conversationsGroupModel.findById(id);

    return convertConversationGroupSchemaFromMongoose.parse(conversation);
  }

  public async isExistingConversation(id: bigint): Promise<boolean> {
    const exists = await this.conversationsGroupModel.exists({ _id: id });
    return !!exists;
  }

  public async updateTime(id: bigint, time?: Date) {
    await this.conversationsGroupModel.updateOne(
      { _id: id },
      { $max: { updatedAt: time ?? new Date() } },
      { timestamps: false },
    );
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

  public async getParticipantIds(conversationId: bigint): Promise<string[]> {
    const participants = await this.conversationGroupMemberModel.find({
      groupId: conversationId,
    });

    return participants.map((p) => p.userId);
  }

  public async findConversationsContainingUser(
    userId: string,
    timestamp: Date,
  ): Promise<ConversationGroupDto[]> {
    const memberships = await this.conversationGroupMemberModel.find({
      userId,
    });

    const groupIds = memberships.map((m) => m.groupId);

    const conversations = await this.conversationsGroupModel.find({
      _id: { $in: groupIds },
      updatedAt: { $gt: timestamp },
    });

    return convertConversationGroupSchemaFromMongoose
      .array()
      .parse(conversations);
  }

  public async getMembers(id: bigint): Promise<ConversationGroupMemberDto[]> {
    const members = await this.conversationGroupMemberModel.find({
      groupId: id,
    });

    return convertConversationGroupMemberSchemaFromMongoose
      .array()
      .parse(members);
  }

  public async findMembershipsForConversations(conversationIds: bigint[]) {
    return this.conversationGroupMemberModel.find({
      groupId: {
        $in: conversationIds,
      },
    });
  }
}
