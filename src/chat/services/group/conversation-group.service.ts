import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ConversationGroupDto,
  convertConversationGroupSchemaFromMongoose,
} from 'src/chat/dto/group/conversation-group/conversation-group.dto';
import { CreateConversationGroupDto } from 'src/chat/dto/group/conversation-group/create-conversation.dto';
import {
  ConversationGroup,
  ConversationGroupDocument,
} from 'src/chat/entities/group/conversation-group.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ConversationGroupService {
  constructor(
    @InjectModel(ConversationGroup.name)
    private readonly conversationsGroupModel: Model<ConversationGroupDocument>,
    private readonly userService: UserService,
  ) {}

  public async create(
    creatorId: string,
    createConversationGroupDto: CreateConversationGroupDto,
  ): Promise<ConversationGroupDto> {
    const { name, participants } = createConversationGroupDto;

    const areExistingUsers =
      await this.userService.areExistingUsers(participants);

    if (!areExistingUsers)
      throw new ForbiddenException(
        'Given participants are not registered with us',
      );

    const uniqueParticipants = Array.from(
      new Set([...participants, creatorId]),
    );

    const conversation = await this.conversationsGroupModel.create({
      name,
      participants: uniqueParticipants,
      admins: [creatorId],
    });

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
    const allUserConversations = await this.conversationsGroupModel
      .find({
        participants: userId,
      })
      .select('_id participants');
    const contactIds = new Set<string>();
    const conversationIds: string[] = [];

    allUserConversations.forEach((c) => {
      conversationIds.push(c._id.toString());
      c.participants.forEach((p) => {
        const participantId = p.toString();
        if (participantId !== userId) {
          contactIds.add(participantId);
        }
      });
    });

    return {
      conversationIds,
      contactIds: Array.from(contactIds),
    };
  }

  public async getParticipantIds(conversationId: bigint): Promise<string[]> {
    const conversation = await this.conversationsGroupModel
      .findOne({ _id: conversationId })
      .select('participants');

    return conversation?.participants.map((p) => p.toString()) || [];
  }

  public async findConversationsContainingUser(
    userId: string,
    timestamp: Date,
  ): Promise<ConversationGroupDto[]> {
    const conversations = await this.conversationsGroupModel.find({
      participants: userId,
      updatedAt: { $gt: timestamp },
    });

    return convertConversationGroupSchemaFromMongoose
      .array()
      .parse(conversations);
  }
}
