import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@webundsoehne/nest-fastify-file-upload';
import jwtConfig from 'apps/auth/configs/jwt.config';
import { UploadsModule } from 'apps/uploads/uploads.module';
import { UserModule } from 'apps/user/user.module';

import { ChatGateway } from './chat.gateway';
import { ChatDirectController } from './controllers/chat-direct.controller';
import { ChatGroupController } from './controllers/chat-group.controller';
import {
  ChatsGroup,
  ChatsGroupSchema,
} from './entities/group/chats-group.entity';
import {
  ConversationGroupMember,
  ConversationGroupMemberSchema,
} from './entities/group/conversation-group-members.entity';
import {
  ConversationGroup,
  ConversationGroupSchema,
} from './entities/group/conversation-group.entity';
import {
  ChatsOneToOne,
  ChatsOneToOneSchema,
} from './entities/one-to-one/chats-one-to-one.entity';
import {
  ConversationOneToOne,
  ConversationOneToOneSchema,
} from './entities/one-to-one/conversation-one-to-one.entity';
import { ChatService } from './services/chat.service';
import { ConversationGroupOrchestratorService } from './services/conversation-group-orchestrator.service';
import { ChatsGroupService } from './services/group/chats-group.service';
import { ConversationGroupMemberService } from './services/group/conversation-group-member.service';
import { ConversationGroupService } from './services/group/conversation-group.service';
import { ChatsOneToOneService } from './services/one-to-one/chats-one-to-one.service';
import { ConversationOneToOneService } from './services/one-to-one/conversation-one-to-one.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'embed-messages' }),
    UserModule,
    UploadsModule,
    MongooseModule.forFeature([
      { name: ConversationOneToOne.name, schema: ConversationOneToOneSchema },
      { name: ChatsOneToOne.name, schema: ChatsOneToOneSchema },
      { name: ConversationGroup.name, schema: ConversationGroupSchema },
      {
        name: ConversationGroupMember.name,
        schema: ConversationGroupMemberSchema,
      },
      { name: ChatsGroup.name, schema: ChatsGroupSchema },
    ]),
    MulterModule.register({ dest: './public' }),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [ChatDirectController, ChatGroupController],
  providers: [
    ChatGateway,
    ChatService,
    ChatsOneToOneService,
    ConversationOneToOneService,
    ConversationGroupService,
    ConversationGroupMemberService,
    ConversationGroupOrchestratorService,
    ChatsGroupService,
  ],
  exports: [
    ChatService,
    ChatsOneToOneService,
    ConversationOneToOneService,
    ConversationGroupService,
    ConversationGroupMemberService,
    ConversationGroupOrchestratorService,
    ChatsGroupService,
  ],
})
export class ChatModule {}
