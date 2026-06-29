import { Module } from '@nestjs/common';
import { ChatModule } from 'apps/chat/chat.module';
import { UserModule } from 'apps/user/user.module';

import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';

@Module({
  imports: [UserModule, ChatModule],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}
