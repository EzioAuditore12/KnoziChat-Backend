import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import {
  ChatsGroup,
  ChatsGroupDocument,
} from 'apps/chat/entities/group/chats-group.entity';
import { ConversationGroupService } from './conversation-group.service';
import { InsertGroupChatDto } from 'apps/chat/dto/group/chats-group/insert-group-chat.dto';
import { SnowFlakeId } from 'apps/common/utils/snowflake';
import {
  ChatsGroupDto,
  convertChatsGroupFromMongoose,
} from 'apps/chat/dto/group/chats-group/chats-group.dto';
import { InsertGroupChatsSystemEventDto } from 'apps/chat/dto/group/chats-group/insert-group-chat-system-event.dto';
import { InsertGroupChatContentDto } from 'apps/chat/dto/group/chats-group/insert-group-chat-content.dto';

@Injectable()
export class ChatsGroupService {
  constructor(
    @Inject(forwardRef(() => ConversationGroupService))
    private readonly conversationGroupService: ConversationGroupService,
    @InjectModel(ChatsGroup.name)
    private readonly chatsGroupModel: Model<ChatsGroupDocument>,
  ) {}

  public async insert(
    insertChatGroupDto: InsertGroupChatDto,
    session?: ClientSession,
  ): Promise<ChatsGroupDto> {
    const { id, conversationId, createdAt, ...rest } = insertChatGroupDto;

    let insertionTime: Date = createdAt ?? new Date();

    const insertedChat = await this.chatsGroupModel.insertOne(
      {
        _id: id ? BigInt(id) : new SnowFlakeId(1).generate(),
        conversationId: BigInt(conversationId),
        createdAt: insertionTime,
        ...rest,
      },
      { session },
    );

    await this.conversationGroupService.updateTime(
      BigInt(conversationId),
      insertionTime,
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

  public async insertSystemEvent(
    insertGroupChatsSystemEventDto: InsertGroupChatsSystemEventDto,
    session?: ClientSession,
  ): Promise<ChatsGroupDto> {
    const { id, conversationId, ...rest } = insertGroupChatsSystemEventDto;

    const insertedSystemEvent = await this.chatsGroupModel.insertOne(
      {
        _id: id ? BigInt(id) : new SnowFlakeId(1).generate(),
        conversationId: BigInt(conversationId),
        ...rest,
      },
      { session },
    );

    return convertChatsGroupFromMongoose.parse(insertedSystemEvent);
  }

  public async insertContent(
    insertGroupChatContentDto: InsertGroupChatContentDto,
    session?: ClientSession,
  ): Promise<ChatsGroupDto> {
    const { id, conversationId, ...rest } = insertGroupChatContentDto;

    const insertedChatContent = await this.chatsGroupModel.insertOne(
      {
        _id: id ? BigInt(id) : new SnowFlakeId(1).generate(),
        conversationId: BigInt(conversationId),
        ...rest,
      },
      { session },
    );

    return convertChatsGroupFromMongoose.parse(insertedChatContent);
  }
}
