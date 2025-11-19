import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  GroupChatSchema,
  GroupChat,
} from './entities/group-chat/group-chat.entity';
import {
  DirectMessage,
  DirectMessageSchema,
} from './entities/direct-message.entity';
import {
  GroupMessage,
  GroupMessageSchema,
} from './entities/group-chat/group-message.entity';

import { ChatGateway } from './chat.gateway';
import { DirectChatService } from './services/direct-chat.service';
import { DirectChatController } from './controllers/direct-chat.controller';

@Module({
  controllers: [DirectChatController],
  imports: [
    MongooseModule.forFeature([
      { name: DirectMessage.name, schema: DirectMessageSchema },
      { name: GroupChat.name, schema: GroupChatSchema },
      { name: GroupMessage.name, schema: GroupMessageSchema },
    ]),
  ],
  providers: [ChatGateway, DirectChatService],
})
export class ChatModule {}
