import { Injectable, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { UserService } from 'src/user/user.service';

import {
  Conversation,
  ConversationDocument,
} from '../entities/conversation.entity';

import { ConversationDto } from '../dto/conversation.dto';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,
    private readonly userService: UserService,
  ) {}

  async create(
    senderId: string,
    receiverId: string,
    createdAt?: Date,
    updatedAt?: Date,
  ): Promise<{
    conversation: ConversationDto;
    receiverPushToken: string | undefined | null;
  }> {
    const existingUser = await this.userService.findOne(receiverId);

    if (!existingUser)
      throw new NotFoundException('Given receiver does not exist');

    let conversation = await this.findConversationBetweenSenderAndReceiver(
      senderId,
      receiverId,
    );

    if (!conversation)
      conversation = await this.createConversationBetweenTwoParticipants(
        senderId,
        receiverId,
        createdAt,
        updatedAt,
      );

    return { conversation, receiverPushToken: existingUser.expoPushToken };
  }

  async findConversationBetweenSenderAndReceiver(
    senderId: string,
    receiverId: string,
  ) {
    const conversation = await this.conversationModel.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    return conversation ?? null;
  }

  async createConversationBetweenTwoParticipants(
    senderId: string,
    receiverId: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    return await this.conversationModel.create({
      participants: [senderId, receiverId],
      createdAt: createdAt ?? new Date(),
      updatedAt: updatedAt ?? new Date(),
    });
  }

  async isConversationExisting(conversationId: string): Promise<boolean> {
    const exists = await this.conversationModel.exists({ _id: conversationId });
    return !!exists;
  }

  async findConversationId(
    senderId: string,
    receiverId: string,
  ): Promise<Types.ObjectId | null> {
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

  async findUsersInConversation(conversationId: string) {
    const conversation = await this.conversationModel
      .findById(conversationId)
      .select('participants');
    return conversation ? conversation.participants : [];
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
}
