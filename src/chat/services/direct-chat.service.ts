import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { PushNotificationDto } from 'src/common/dto/push-notification.dto';

import { DirectChat, DirectChatDocument } from '../entities/direct-chat.entity';

import { SEND_PUSH_NOTIFICATION_QUEUE_NAME } from '../workers/send-push-notification.worker';

import { CreateDirectChatDto } from '../dto/direct-chat/create-direct-chat.dto';

import { ConversationDto } from '../dto/conversation.dto';
import { InsertDirectChatDto } from '../dto/direct-chat/insert-direct-chat.dto';
import { DirectChatDto } from '../dto/direct-chat/direct-chat.dto';

import { ConversationService } from './conversation.service';

@Injectable()
export class DirectChatService {
  constructor(
    @InjectModel(DirectChat.name)
    private readonly directChatModel: Model<DirectChatDocument>,
    @InjectQueue(SEND_PUSH_NOTIFICATION_QUEUE_NAME)
    private readonly sendPushNotificationQueue: Queue,
    private readonly conversationService: ConversationService,
  ) {}

  async create(senderId: string, createDirectChatDto: CreateDirectChatDto) {
    const { receiverId, text } = createDirectChatDto;

    const { conversation, receiverPushToken } =
      await this.conversationService.create(
        senderId,
        receiverId,
        undefined,
        new Date(),
      );

    const createdMessage = await this.directChatModel.create({
      senderId,
      text,
      conversationId: conversation._id,
    });

    if (receiverPushToken) {
      const ticket: PushNotificationDto = {
        expoPushToken: receiverPushToken,
        title: 'Message Request',
        body: text,
      };
      await this.sendPushNotificationQueue.add('process', ticket);
    }

    return createdMessage;
  }

  async insertChat(insertDirectChatDto: InsertDirectChatDto) {
    const {
      conversationId,
      text,
      createdAt,
      updatedAt,
      senderId,
      seen,
      delivered,
    } = insertDirectChatDto;

    // 1. Lightweight check (Optional if you trust the client)
    const exists = await this.conversationService.isConversationExisting(
      conversationId.toHexString(),
    );
    if (!exists) throw new NotFoundException('No such conversation found');

    // 2. Run Create and Update in parallel
    const [insertedMessage] = await Promise.all([
      this.directChatModel.create({
        senderId,
        text,
        conversationId: new Types.ObjectId(conversationId),
        seen,
        delivered,
        createdAt: createdAt ?? new Date(),
        updatedAt: updatedAt ?? new Date(),
      }),
    ]);

    return insertedMessage;
  }

  async findChatsByConversationId(
    conversationId: string,
  ): Promise<DirectChatDto[]> {
    return await this.directChatModel.find({ conversationId });
  }

  async findChatsSince(
    conversationId: string,
    timestamp: Date,
  ): Promise<DirectChatDto[]> {
    return await this.directChatModel.find({
      conversationId,
      createdAt: { $gt: timestamp },
    });
  }

  async findChatsSinceForConversations(
    conversationIds: string[],
    timestamp: Date,
  ): Promise<DirectChatDto[]> {
    if (!conversationIds.length) return [];
    return await this.directChatModel.find({
      conversationId: {
        $in: conversationIds.map((val) => new Types.ObjectId(val)),
      },
      createdAt: { $gt: timestamp },
    });
  }
}
