import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  DirectMessage,
  DirectMessageDocument,
} from '../entities/direct-message.entity';
import { CreateDirectChatDto } from '../dto/direct-chat/create-direct-chat.dto';
import { ChatGateway } from '../chat.gateway';
import { plainToInstance } from 'class-transformer';
import { DirectMessageDto } from '../dto/direct-message.dto';

@Injectable()
export class DirectChatService {
  constructor(
    @InjectModel(DirectMessage.name)
    private readonly directMessageModel: Model<DirectMessageDocument>,
    private readonly chatGateway: ChatGateway,
  ) {}

  async create(
    senderId: string,
    receiverId: string,
    createDirectChatDto: CreateDirectChatDto,
  ) {
    const { text } = createDirectChatDto;

    const createdMessage = await this.directMessageModel.create({
      senderId,
      receiverId,
      text,
    });

    this.chatGateway.sendMessage(
      plainToInstance(DirectMessageDto, createdMessage, {
        excludeExtraneousValues: true,
      }),
    );

    return createdMessage;
  }

  async findOne(senderId: string, receiverId: string) {
    return await this.directMessageModel.findOne({
      senderId,
      receiverId,
    });
  }
}
