import { Module } from '@nestjs/common';

import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';

import { UserModule } from 'src/user/user.module';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [UserModule, ChatModule],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}
