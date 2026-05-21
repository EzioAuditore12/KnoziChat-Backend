import {
  ForbiddenException,
  Injectable,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';

import {
  ConversationGroupDto,
  convertConversationGroupSchemaFromMongoose,
} from 'src/chat/dto/group/conversation-group/conversation-group.dto';
import { CreateConversationGroupResponseDto } from 'src/chat/dto/group/conversation-group/create-conversation/create-conversation-responses.dto';
import { CreateConversationGroupDto } from 'src/chat/dto/group/conversation-group/create-conversation/create-conversation.dto';

import {
  ConversationGroup,
  ConversationGroupDocument,
} from 'src/chat/entities/group/conversation-group.entity';
import { UserService } from 'src/user/user.service';
import { ChatsGroupService } from './chats-group.service';
import { ConversationGroupMemberService } from './conversation-group-member.service';

@Injectable()
export class ConversationGroupService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    @InjectModel(ConversationGroup.name)
    private readonly conversationsGroupModel: Model<ConversationGroupDocument>,

    @Inject(forwardRef(() => ChatsGroupService))
    private readonly chatGroupService: ChatsGroupService,
    @Inject(forwardRef(() => ConversationGroupMemberService))
    private readonly conversationGroupMemberService: ConversationGroupMemberService,

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

      await this.conversationGroupMemberService.insertGroupParticipants(
        conversation._id,
        uniqueParticipants,
        [creatorId],
        conversation.createdAt,
        session,
      );

      const firstChat = await this.chatGroupService.insert({
        contentType: 'system',
        conversationId: conversation._id.toString(),
        senderId: creatorId,
        systemEventType: 'group_created',
        metadata: {
          creatorId,
          uniqueParticipants,
          groupName: conversation.name,
        },
      });

      await session.commitTransaction();

      return {
        id: conversation._id.toString(),
        adminIds: [creatorId],
        avatar: conversation.avatar,
        name: conversation.name,
        participantIds: uniqueParticipants,
        chat: firstChat,
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

  public async findConversationsContainingUser(
    userId: string,
    timestamp: Date,
  ): Promise<ConversationGroupDto[]> {
    const groupIds =
      await this.conversationGroupMemberService.findUserMemberShipInGroups(
        userId,
      );

    const conversations = await this.conversationsGroupModel.find({
      _id: { $in: groupIds },
      updatedAt: { $gt: timestamp },
    });

    return convertConversationGroupSchemaFromMongoose
      .array()
      .parse(conversations);
  }
}
