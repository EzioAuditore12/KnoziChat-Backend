import { Module } from '@nestjs/common';

import { SyncController } from './sync.controller';
import { UserService } from 'src/user/user.service';
import { DirectChatService } from 'src/chat/services/direct-chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DirectChat,
  DirectChatSchema,
} from 'src/chat/entities/direct-chat.entity';
import {
  Conversation,
  ConversationSchema,
} from 'src/chat/entities/conversation.entity';
import { BullModule } from '@nestjs/bullmq';
import { SEND_PUSH_NOTIFICATION_QUEUE_NAME } from 'src/chat/workers/send-push-notification.worker';
import { PullChangeService } from './services/pull-changes.service';
import { PushChangesService } from './services/push-changes.service';
import { ConversationService } from 'src/chat/services/conversation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DirectChat.name, schema: DirectChatSchema },
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    TypeOrmModule.forFeature([User]),
    BullModule.registerQueue({ name: SEND_PUSH_NOTIFICATION_QUEUE_NAME }),
  ],
  controllers: [SyncController],
  providers: [
    PullChangeService,
    PushChangesService,
    UserService,
    ConversationService,
    DirectChatService,
  ],
})
export class SyncModule {}
