import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ConversationOneToOneDto,
  convertConversationOneToOneSchemaFromMongoose,
} from 'src/chat/dto/one-to-one/conversation-one-to-one/conversation-one-to-one.dto';
import { CreateConversationOneToOneDto } from 'src/chat/dto/one-to-one/conversation-one-to-one/create-one-to-one-conversation.dto';
import {
  ConversationOneToOne,
  ConversationOneToOneDocument,
} from 'src/chat/entities/one-to-one/conversation-one-to-one.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ConversationOneToOneService {
  constructor(
    @InjectModel(ConversationOneToOne.name)
    private readonly conversationsOneToOneModel: Model<ConversationOneToOneDocument>,
    private readonly userService: UserService,
  ) {}

  public async create(
    createConversationOneToOneDto: CreateConversationOneToOneDto,
  ): Promise<ConversationOneToOneDto> {
    const { participant1, participant2, createdAt, updatedAt } =
      createConversationOneToOneDto;

    let conversation = await this.findConversationBetweenParicipants(
      participant1,
      participant2,
    );

    if (!conversation) {
      const areExistingUser = await this.userService.areExistingUsers([
        participant1,
        participant2,
      ]);

      if (!areExistingUser)
        throw new NotFoundException('One of the given user is not valid');

      conversation = await this.createConversationBetweenParticipants(
        participant1,
        participant2,
        createdAt,
        updatedAt,
      );
    }

    return conversation;
  }

  public async updateConversationTime(
    id: bigint,
    time: Date | undefined,
  ): Promise<void> {
    await this.conversationsOneToOneModel.updateOne(
      { _id: id },
      { $max: { updatedAt: time ?? new Date() } },
      { timestamps: false },
    );
  }

  public async isExistingConversation(id: bigint): Promise<boolean> {
    const exists = await this.conversationsOneToOneModel.exists({ _id: id });
    return !!exists;
  }

  public async findAllUserConversationsAndContacts(
    userId: string,
  ): Promise<{ conversationIds: string[]; contactIds: string[] }> {
    const allUserConversations = await this.conversationsOneToOneModel
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

  public async findConversationsContainingUser(
    userId: string,
    timestamp: Date,
  ): Promise<ConversationOneToOneDto[]> {
    const conversations = await this.conversationsOneToOneModel.find({
      participants: userId,
      updatedAt: { $gt: timestamp },
    });

    return convertConversationOneToOneSchemaFromMongoose
      .array()
      .parse(conversations);
  }

  private async findConversationBetweenParicipants(
    participant1: string,
    participant2: string,
  ): Promise<ConversationOneToOneDto | null> {
    const conversation = await this.conversationsOneToOneModel.findOne({
      participants: { $all: [participant1, participant2] },
    });

    if (!conversation) return null;

    return convertConversationOneToOneSchemaFromMongoose.parse(conversation);
  }

  private async createConversationBetweenParticipants(
    participant1: string,
    participant2: string,
    createdAt?: Date,
    updatedAt?: Date,
  ): Promise<ConversationOneToOneDto> {
    const conversation = await this.conversationsOneToOneModel.create({
      participants: [participant1, participant2],
      createdAt: createdAt ?? new Date(),
      updatedAt: updatedAt ?? new Date(),
    });

    return convertConversationOneToOneSchemaFromMongoose.parse(conversation);
  }
}
