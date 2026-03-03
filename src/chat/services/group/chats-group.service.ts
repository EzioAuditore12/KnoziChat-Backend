import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ChatsGroup,
  ChatsGroupDocument,
} from 'src/chat/entities/group/chats-group';
import { ConversationGroupService } from './conversation-group.service';

@Injectable()
export class ChatsGroupService {
  constructor(
    private readonly conversationGroupService: ConversationGroupService,
    @InjectModel(ChatsGroup.name)
    private readonly chatsGroupModel: Model<ChatsGroupDocument>,
  ) {}
}
