import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import Expo from 'expo-server-sdk';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DirectChatService } from './services/direct-chat.service';
import { DirectChatController } from './controllers/direct-chat.controller';

import { DirectChat, DirectChatSchema } from './entities/direct-chat.entity';
import {
  Conversation,
  ConversationSchema,
} from './entities/conversation.entity';

import {
  SEND_PUSH_NOTIFICATION_QUEUE_NAME,
  SendPushNotificationQueue,
} from './workers/send-push-notification.worker';

import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DirectChat.name, schema: DirectChatSchema },
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    TypeOrmModule.forFeature([User]),
    BullModule.registerQueue({ name: SEND_PUSH_NOTIFICATION_QUEUE_NAME }),
  ],
  controllers: [DirectChatController],
  providers: [UserService, DirectChatService, Expo, SendPushNotificationQueue],
})
export class ChatModule {}
