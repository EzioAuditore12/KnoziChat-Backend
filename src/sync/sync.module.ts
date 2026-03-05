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
import {
  ConversationGroup,
  ConversationGroupSchema,
} from 'src/chat/entities/group/conversation-group.entity';
import {
  ChatsGroup,
  ChatsGroupSchema,
} from 'src/chat/entities/group/chats-group';
import { ConversationGroupService } from 'src/chat/services/group/conversation-group.service';
import { ChatsGroupService } from 'src/chat/services/group/chats-group.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MongooseModule.forFeature([
      { name: ConversationOneToOne.name, schema: ConversationOneToOneSchema },
      { name: ChatsOneToOne.name, schema: ChatsOneToOneSchema },
      { name: ConversationGroup.name, schema: ConversationGroupSchema },
      { name: ChatsGroup.name, schema: ChatsGroupSchema },
    ]),
  ],
  controllers: [SyncController],
  providers: [
    SyncService,
    ChatsOneToOneService,
    ConversationOneToOneService,
    ConversationGroupService,
    ChatsGroupService,
    UserService,
  ],
})
export class SyncModule {}
