import {
  BadRequestException,
  OnModuleInit,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ConversationOneToOneDto,
  convertConversationOneToOneSchemaFromMongoose,
} from 'apps/chat/dto/one-to-one/conversation-one-to-one/conversation-one-to-one.dto';
import { CreateConversationOneToOneDto } from 'apps/chat/dto/one-to-one/conversation-one-to-one/create-one-to-one-conversation.dto';
import {
  ConversationOneToOne,
  ConversationOneToOneDocument,
} from 'apps/chat/entities/one-to-one/conversation-one-to-one.entity';
import { UserService } from 'apps/user/user.service';

@Injectable()
export class ConversationOneToOneService {
  constructor(
    @InjectModel(ConversationOneToOne.name)
    private readonly conversationsOneToOneModel: Model<ConversationOneToOneDocument>,
    private readonly userService: UserService,
  ) {}

  public async onModuleInit(): Promise<void> {
    await this.conversationsOneToOneModel.syncIndexes();
  }

  public async create(
    createConversationOneToOneDto: CreateConversationOneToOneDto,
  ): Promise<ConversationOneToOneDto> {
    const { participant1, participant2, createdAt, updatedAt } =
      createConversationOneToOneDto;

    if (participant1 === participant2) {
      throw new BadRequestException(
        'Cannot start a conversation with yourself',
      );
    }

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

  public async isExistingConversationParticipant(
    id: bigint,
    userId: string,
  ): Promise<boolean> {
    const exists = await this.conversationsOneToOneModel.exists({
      _id: id,
      $or: [{ participant1: userId }, { participant2: userId }],
    });
    return !!exists;
  }

  public async findAllUserConversationsAndContacts(
    userId: string,
  ): Promise<{ conversationIds: string[]; contactIds: string[] }> {
    const allUserConversations = await this.conversationsOneToOneModel
      .find({
        $or: [{ participant1: userId }, { participant2: userId }],
      })
      .select('_id participant1 participant2');
    const contactIds = new Set<string>();
    const conversationIds: string[] = [];

    allUserConversations.forEach((c) => {
      conversationIds.push(c._id.toString());
      const plainConversation = this.toPlainConversation(c);
      const participant1 = String(plainConversation.participant1);
      const participant2 = String(plainConversation.participant2);

      [participant1, participant2].forEach((p) => {
        if (p !== userId) {
          contactIds.add(p);
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
      $or: [{ participant1: userId }, { participant2: userId }],
      updatedAt: { $gt: timestamp },
    });

    return convertConversationOneToOneSchemaFromMongoose
      .array()
      .parse(
        conversations.map((conversation) =>
          this.toPlainConversation(conversation),
        ),
      );
  }

  private async findConversationBetweenParicipants(
    participant1: string,
    participant2: string,
  ): Promise<ConversationOneToOneDto | null> {
    const participantsKey = this.getParticipantsKey(participant1, participant2);

    const conversation = await this.conversationsOneToOneModel.findOne({
      participantsKey,
    });

    if (!conversation) return null;

    return convertConversationOneToOneSchemaFromMongoose.parse(
      this.toPlainConversation(conversation),
    );
  }

  private async createConversationBetweenParticipants(
    participant1: string,
    participant2: string,
    createdAt?: Date,
    updatedAt?: Date,
  ): Promise<ConversationOneToOneDto> {
    const [sortedParticipant1, sortedParticipant2] = [
      participant1,
      participant2,
    ].sort();
    const participantsKey = [sortedParticipant1, sortedParticipant2].join(':');

    try {
      const conversation = await this.conversationsOneToOneModel.create({
        participant1: sortedParticipant1,
        participant2: sortedParticipant2,
        participantsKey,
        createdAt: createdAt ?? new Date(),
        updatedAt: updatedAt ?? new Date(),
      });

      return convertConversationOneToOneSchemaFromMongoose.parse(
        this.toPlainConversation(conversation),
      );
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        const existingConversation =
          await this.conversationsOneToOneModel.findOne({ participantsKey });

        if (existingConversation) {
          return convertConversationOneToOneSchemaFromMongoose.parse(
            this.toPlainConversation(existingConversation),
          );
        }
      }

      throw error;
    }
  }

  private getParticipantsKey(
    participant1: string,
    participant2: string,
  ): string {
    return [participant1, participant2].sort().join(':');
  }

  private toPlainConversation(conversation: unknown): Record<string, unknown> {
    if (
      conversation &&
      typeof conversation === 'object' &&
      'toObject' in conversation &&
      typeof (conversation as { toObject: () => Record<string, unknown> })
        .toObject === 'function'
    ) {
      return (
        conversation as { toObject: () => Record<string, unknown> }
      ).toObject();
    }

    return (conversation ?? {}) as Record<string, unknown>;
  }

  public async updateLastSeenAt(
    conversationId: bigint,
    userId: string,
  ): Promise<Date> {
    const now = new Date();

    await this.conversationsOneToOneModel.findByIdAndUpdate(
      conversationId,
      {
        $set: {
          [`lastSeenAt.${userId}`]: now,
          updatedAt: now,
        },
      },
      { returnDocument: 'after' },
    );

    return now;
  }
}
