import { Injectable } from '@nestjs/common';
import { ConversationOneToOneService } from './conversation-one-to-one.service';

import { StartNewConversationDto } from 'src/chat/dto/one-to-one/start-new-conversation/start-new-conversation.dto';
import { InsertOneToOneChatDto } from 'src/chat/dto/one-to-one/chats-one-to-one/insert-one-to-one-chat.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  ChatsOneToOne,
  ChatsOneToOneDocument,
} from 'src/chat/entities/one-to-one/chats-one-to-one.entity';
import { Model } from 'mongoose';
import {
  ChatsOneToOneDto,
  chatsOneToOneSchema,
  convertChatsOneToOneFromMongoose,
} from 'src/chat/dto/one-to-one/chats-one-to-one/chats-one-to-one.dto';
import { SnowFlakeId } from 'src/common/utils/snowflake';
import { StartNewConversationResponseDto } from 'src/chat/dto/one-to-one/start-new-conversation/start-new-conversation-response.dto';

@Injectable()
export class ChatsOneToOneService {
  constructor(
    private readonly conversationOneToOneService: ConversationOneToOneService,
    @InjectModel(ChatsOneToOne.name)
    private readonly chatsOneToOneRepository: Model<ChatsOneToOneDocument>,
  ) {}

  public async startNewConversation(
    senderId: string,
    startNewConversationDto: StartNewConversationDto,
  ): Promise<StartNewConversationResponseDto> {
    const { receiverId, text, createdAt, updatedAt } = startNewConversationDto;

    const conversation = await this.conversationOneToOneService.create({
      participant1: senderId,
      participant2: receiverId,
      createdAt,
      updatedAt,
    });

    const insertedChat = await this.insert({
      conversationId: conversation.id,
      senderId,
      status: 'SENT',
      text,
      createdAt,
      updatedAt,
    });

    return {
      ...insertedChat,
      receiverId,
    };
  }

  public async insert(
    insertOneToOneChatDto: InsertOneToOneChatDto,
  ): Promise<ChatsOneToOneDto> {
    const { id, conversationId, senderId, status, text, createdAt, updatedAt } =
      insertOneToOneChatDto;

    const insertedChat = await this.chatsOneToOneRepository.insertOne({
      _id: id ? BigInt(id) : new SnowFlakeId(1).generate(),
      conversationId: BigInt(conversationId),
      senderId,
      status,
      text,
      createdAt: createdAt ?? new Date(),
      updatedAt: updatedAt ?? new Date(),
    });

    await this.conversationOneToOneService.updateConversationTime(
      BigInt(conversationId),
      createdAt,
    );

    return convertChatsOneToOneFromMongoose.parse(insertedChat);
  }

  public async findChatsByConversationId(
    conversationId: bigint,
  ): Promise<ChatsOneToOneDto[]> {
    const chats = await this.chatsOneToOneRepository.find({ conversationId });

    return convertChatsOneToOneFromMongoose.array().parse(chats);
  }

  public async findChatsSince(
    conversationId: bigint,
    timestamp: Date,
  ): Promise<ChatsOneToOneDto[]> {
    const chats = await this.chatsOneToOneRepository.find({
      conversationId,
      createdAt: { $gt: timestamp },
    });

    return convertChatsOneToOneFromMongoose.array().parse(chats);
  }

  public async findChatsSinceForConversations(
    conversationIds: string[],
    timestamp: Date,
  ): Promise<ChatsOneToOneDto[]> {
    if (!conversationIds.length) return [];
    const chats = await this.chatsOneToOneRepository.find({
      conversationId: {
        $in: conversationIds.map((val) => BigInt(val)),
      },
      createdAt: { $gt: timestamp },
    });

    return convertChatsOneToOneFromMongoose.array().parse(chats);
  }
}
