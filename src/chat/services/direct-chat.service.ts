import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  DirectMessage,
  DirectMessageDocument,
} from '../entities/direct-message.entity';
import { CreateDirectChatDto } from '../dto/direct-chat/create-direct-chat.dto';

@Injectable()
export class DirectChatService {
  constructor(
    @InjectModel(DirectMessage.name)
    private readonly directMessageModel: Model<DirectMessageDocument>,
  ) {}

  async create(
    senderId: string,
    receiverId: string,
    createDirectChatDto: CreateDirectChatDto,
  ) {
    const { text } = createDirectChatDto;

    return await this.directMessageModel.create({
      senderId,
      receiverId,
      text,
    });
  }

  async findOne(senderId: string, receiverId: string) {
    return await this.directMessageModel.findOne({
      senderId,
      receiverId,
    });
  }
}
