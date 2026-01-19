import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { UserService } from 'src/user/user.service';

import { PushNotificationDto } from 'src/common/dto/push-notification.dto';
import {
  Conversation,
  ConversationDocument,
} from '../entities/conversation.entity';
import { DirectChat, DirectChatDocument } from '../entities/direct-chat.entity';

import { SEND_PUSH_NOTIFICATION_QUEUE_NAME } from '../workers/send-push-notification.worker';

import { CreateDirectChatDto } from '../dto/direct-chat/create-direct-chat.dto';

import { ConversationDto } from '../dto/conversation.dto';
import { InsertChatDto } from '../dto/direct-chat/insert-direct-chat.dto';
import { DirectChatDto } from '../dto/direct-chat/direct-chat.dto';

@Injectable()
export class DirectChatService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,
    @InjectModel(DirectChat.name)
    private readonly directChatModel: Model<DirectChatDocument>,
    @InjectQueue(SEND_PUSH_NOTIFICATION_QUEUE_NAME)
    private readonly sendPushNotificationQueue: Queue,
    private readonly userService: UserService,
  ) {}

  async create(senderId: string, createDirectChatDto: CreateDirectChatDto) {
    const { receiverId, text } = createDirectChatDto;

    const existingUser = await this.userService.findOne(receiverId);

    if (!existingUser)
      throw new NotFoundException('User with this id does not exist');

    let conversation = await this.conversationModel.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await this.conversationModel.create({
        participants: [senderId, receiverId],
      });
    }

    // 2. Create Message linked to Conversation
    const createdMessage = await this.directChatModel.create({
      senderId,
      text,
      conversationId: conversation._id,
    });

    if (existingUser.expoPushToken) {
      const ticket: PushNotificationDto = {
        expoPushToken: existingUser.expoPushToken,
        title: 'Message Request',
        body: text,
      };
      await this.sendPushNotificationQueue.add('process', ticket);
    }

    // Optional: Update last message in conversation for "Inbox" preview
    await this.conversationModel.findByIdAndUpdate(conversation._id, {
      lastMessage: text.slice(0, 50),
    });

    Logger.log(createdMessage);
    return createdMessage;
  }

  async insertChat(senderId: string, insertChatDto: InsertChatDto) {
    const { conversationId, text, _id, createdAt } = insertChatDto;

    // 1. Lightweight check (Optional if you trust the client)
    const exists = await this.conversationModel.exists({ _id: conversationId });
    if (!exists) throw new NotFoundException('No such conversation found');

    // 2. Run Create and Update in parallel
    const [insertedMessage] = await Promise.all([
      this.directChatModel.create({
        _id,
        senderId,
        text,
        conversationId: new Types.ObjectId(conversationId),
      }),
      this.conversationModel.findByIdAndUpdate(conversationId, {
        lastMessage: text,
        createdAt: new Date(createdAt),
      }),
    ]);

    Logger.log(insertedMessage);
    return insertedMessage;
  }

  async findConversationId(
    senderId: string,
    receiverId: string,
  ): Promise<Types.ObjectId | null> {
    // Much faster: Query the Conversation collection directly
    const conversation = await this.conversationModel.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    return conversation ? conversation._id : null;
  }

  async findConversationsContainingUser(
    userId: string,
    timestamp: Date,
  ): Promise<ConversationDto[]> {
    return await this.conversationModel.find({
      participants: userId,
      updatedAt: { $gt: timestamp },
    });
  }

  async findAllUsersInConversationsWithUser(userId: string): Promise<string[]> {
    const allUserConversations = await this.conversationModel
      .find({ participants: userId })
      .select('_id participants');

    const contactIds = new Set<string>();

    allUserConversations.forEach((c) => {
      c.participants.forEach((p) => {
        const participantId = p.toString();
        // Only add if it's not the current user
        if (participantId !== userId) {
          contactIds.add(participantId);
        }
      });
    });

    return Array.from(contactIds);
  }

  async findChatsByConversationId(
    conversationId: string,
  ): Promise<ConversationDto[]> {
    return await this.directChatModel.find({ conversationId });
  }

  async findUsersInConversation(conversationId: string) {
    const conversation = await this.conversationModel
      .findById(conversationId)
      .select('participants');
    return conversation ? conversation.participants : [];
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

  async findAllUserConversationsAndContacts(
    userId: string,
  ): Promise<{ conversationIds: string[]; contactIds: string[] }> {
    const allUserConversations = await this.conversationModel
      .find({ participants: userId })
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
