import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DirectChat, DirectChatSchema } from './entities/direct-chat.entity';
import {
  Conversation,
  ConversationSchema,
} from './entities/conversation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import Expo from 'expo-server-sdk';
import { DirectChatService } from './services/direct-chat.service';
import { BullModule } from '@nestjs/bullmq';
import { SEND_PUSH_NOTIFICATION_QUEUE_NAME } from './workers/send-push-notification.worker';
import { ConversationService } from './services/conversation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DirectChat.name, schema: DirectChatSchema },
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    TypeOrmModule.forFeature([User]),
    BullModule.registerQueue({ name: SEND_PUSH_NOTIFICATION_QUEUE_NAME }),
  ],
  controllers: [ChatController],
  providers: [ConversationService, DirectChatService, UserService, Expo],
})
export class ChatModule {}
