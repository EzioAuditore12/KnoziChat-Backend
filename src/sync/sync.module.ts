import { Module } from '@nestjs/common';

import {
  ConversationOneToOne,
  ConversationOneToOneSchema,
} from 'src/chat/entities/one-to-one/conversation-one-to-one.entity';
import {
  ChatsOneToOne,
  ChatsOneToOneSchema,
} from 'src/chat/entities/one-to-one/chats-one-to-one.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from 'src/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { ChatsOneToOneService } from 'src/chat/services/one-to-one/chats-one-to-one.service';
import { ConversationOneToOneService } from 'src/chat/services/one-to-one/conversation-one-to-one.service';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MongooseModule.forFeature([
      { name: ConversationOneToOne.name, schema: ConversationOneToOneSchema },
      { name: ChatsOneToOne.name, schema: ChatsOneToOneSchema },
    ]),
  ],
  controllers: [SyncController],
  providers: [
    SyncService,
    ChatsOneToOneService,
    ConversationOneToOneService,
    UserService,
  ],
})
export class SyncModule {}
