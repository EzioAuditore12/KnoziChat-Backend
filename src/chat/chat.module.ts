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
import { ChatGateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from 'src/auth/configs/jwt.config';
import { ChatService } from './services/chat.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DirectChat.name, schema: DirectChatSchema },
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    TypeOrmModule.forFeature([User]),
    BullModule.registerQueue({ name: SEND_PUSH_NOTIFICATION_QUEUE_NAME }),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ConversationService,
    DirectChatService,
    ChatGateway,
    UserService,
    Expo,
  ],
})
export class ChatModule {}
