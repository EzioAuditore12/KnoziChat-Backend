import { Injectable } from '@nestjs/common';
import { ConversationOneToOneService } from './conversation-one-to-one.service';

import { StartNewConversationDto } from 'apps/chat/dto/one-to-one/start-new-conversation/start-new-conversation.dto';
import { InsertOneToOneChatDto } from 'apps/chat/dto/one-to-one/chats-one-to-one/insert-one-to-one-chat.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import {
  ChatsOneToOne,
  ChatsOneToOneDocument,
} from 'apps/chat/entities/one-to-one/chats-one-to-one.entity';
import { Connection, Model } from 'mongoose';
import {
  ChatsOneToOneDto,
  convertChatsOneToOneFromMongoose,
} from 'apps/chat/dto/one-to-one/chats-one-to-one/chats-one-to-one.dto';
import { SnowFlakeId } from 'apps/common/utils/snowflake';
import { StartNewConversationResponseDto } from 'apps/chat/dto/one-to-one/start-new-conversation/start-new-conversation-response.dto';

import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ChatsOneToOneService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    private readonly conversationOneToOneService: ConversationOneToOneService,
    @InjectModel(ChatsOneToOne.name)
    private readonly chatsOneToOneRepository: Model<ChatsOneToOneDocument>,
    @InjectQueue('embed-messages') private readonly embedQueue: Queue,
  ) {}

  public async startNewConversation(
    senderId: string,
    receiverId: string,
    startNewConversationDto: StartNewConversationDto,
  ): Promise<StartNewConversationResponseDto> {
    const { createdAt, updatedAt, attachmentUrl, ...rest } =
      startNewConversationDto;

    const conversation = await this.conversationOneToOneService.create({
      participant1: senderId,
      participant2: receiverId,
      createdAt,
      updatedAt,
    });

    const insertedChat = await this.insert({
      ...rest,
      attachmentUrl: attachmentUrl ?? null,
      conversationId: conversation.id,
      createdAt,
      updatedAt,
      senderId,
      status: 'DELIVERED',
    });

    return {
      ...insertedChat,
      lastSeenAt: conversation.lastSeenAt,
      receiverId,
    };
  }

  public async insert(
    insertOneToOneChatDto: InsertOneToOneChatDto,
  ): Promise<ChatsOneToOneDto> {
    const {
      id,
      conversationId,
      senderId,
      status,
      content,
      attachmentUrl,
      contentType,
      createdAt,
      updatedAt,
    } = insertOneToOneChatDto;

    const insertedChat = await this.chatsOneToOneRepository.insertOne({
      _id: id ? BigInt(id) : new SnowFlakeId(1).generate(),
      conversationId: BigInt(conversationId),
      senderId,
      status,
      content,
      attachmentUrl,
      contentType,
      createdAt: createdAt ?? new Date(),
      updatedAt: updatedAt ?? new Date(),
    });

    await this.conversationOneToOneService.updateConversationTime(
      BigInt(conversationId),
      createdAt,
    );

    const chatDto = convertChatsOneToOneFromMongoose.parse(insertedChat);

    if (chatDto.content) {
      await this.embedQueue.add('embed-message', {
        messageId: String(chatDto.id),
        conversationId: String(chatDto.conversationId),
        senderId: chatDto.senderId,
        content: chatDto.content,
        createdAt: chatDto.createdAt
          ? new Date(chatDto.createdAt).toISOString()
          : new Date().toISOString(),
        isGroup: false,
      });
    }

    return chatDto;
  }

  public async findChatsByConversationId(
    conversationId: bigint,
  ): Promise<ChatsOneToOneDto[]> {
    const chats = await this.chatsOneToOneRepository.find({ conversationId });

    return convertChatsOneToOneFromMongoose.array().parse(chats);
  }

  public async findByIdAndUpdateStatus(
    id: bigint,
    status: ChatsOneToOne['status'],
  ): Promise<ChatsOneToOneDto> {
    const now = new Date();

    const message = await this.chatsOneToOneRepository.findByIdAndUpdate(
      id,
      {
        status,
        updatedAt: now,
      },
      {
        returnDocument: 'after',
      },
    );

    return convertChatsOneToOneFromMongoose.parse(message);
  }

  public async markConversationMessagesSeen(
    conversationId: bigint,
    userId: string,
  ): Promise<{ conversationId: string; userId: string; lastSeenAt: Date }> {
    const lastSeenAt = await this.conversationOneToOneService.updateLastSeenAt(
      conversationId,
      userId,
    );

    await this.chatsOneToOneRepository.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        status: { $ne: 'SEEN' },
        createdAt: { $lte: lastSeenAt },
      },
      {
        $set: {
          status: 'SEEN',
          updatedAt: lastSeenAt,
        },
      },
    );

    return {
      conversationId: conversationId.toString(),
      userId,
      lastSeenAt,
    };
  }

  public async findChatsSince(
    conversationId: bigint,
    timestamp: Date,
  ): Promise<ChatsOneToOneDto[]> {
    const chats = await this.chatsOneToOneRepository.find({
      conversationId,
      $or: [
        { createdAt: { $gt: timestamp } },
        { updatedAt: { $gt: timestamp } },
      ],
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
      $or: [
        { createdAt: { $gt: timestamp } },
        { updatedAt: { $gt: timestamp } },
      ],
    });

    return convertChatsOneToOneFromMongoose.array().parse(chats);
  }
}
