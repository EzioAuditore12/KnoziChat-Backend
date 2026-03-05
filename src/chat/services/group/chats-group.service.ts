import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ChatsGroup,
  ChatsGroupDocument,
} from 'src/chat/entities/group/chats-group';
import { ConversationGroupService } from './conversation-group.service';
import { InsertGroupChatDto } from 'src/chat/dto/group/chats-group/insert-group-chat.dto';
import { SnowFlakeId } from 'src/common/utils/snowflake';
import {
  ChatsGroupDto,
  convertChatsGroupFromMongoose,
} from 'src/chat/dto/group/chats-group/chats-group.dto';

@Injectable()
export class ChatsGroupService {
  constructor(
    private readonly conversationGroupService: ConversationGroupService,
    @InjectModel(ChatsGroup.name)
    private readonly chatsGroupModel: Model<ChatsGroupDocument>,
  ) {}

  public async insert(
    insertChatGroupDto: InsertGroupChatDto,
  ): Promise<ChatsGroupDto> {
    const { id, conversationId, senderId, text, createdAt, updatedAt } =
      insertChatGroupDto;

    const insertedChat = await this.chatsGroupModel.insertOne({
      _id: id ? BigInt(id) : new SnowFlakeId(1).generate(),
      conversationId: BigInt(conversationId),
      senderId,
      text,
      createdAt: createdAt ?? new Date(),
      updatedAt: updatedAt ?? new Date(),
    });

    await this.conversationGroupService.updateTime(
      BigInt(conversationId),
      createdAt,
    );

    return convertChatsGroupFromMongoose.parse(insertedChat);
  }

  public async findChatsByConversationId(
    conversationId: bigint,
  ): Promise<ChatsGroupDto[]> {
    const chats = await this.chatsGroupModel.find({ conversationId });

    return convertChatsGroupFromMongoose.array().parse(chats);
  }

  public async findChatsSince(
    conversationId: bigint,
    timestamp: Date,
  ): Promise<ChatsGroupDto[]> {
    const chats = await this.chatsGroupModel.find({
      conversationId,
      createdAt: { $gt: timestamp },
    });

    return convertChatsGroupFromMongoose.array().parse(chats);
  }

  public async findChatsSinceForConversations(
    conversationIds: string[],
    timestamp: Date,
  ): Promise<ChatsGroupDto[]> {
    if (!conversationIds.length) return [];
    const chats = await this.chatsGroupModel.find({
      conversationId: {
        $in: conversationIds.map((val) => BigInt(val)),
      },
      createdAt: { $gt: timestamp },
    });

    return convertChatsGroupFromMongoose.array().parse(chats);
  }
}
