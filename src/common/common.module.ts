import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { SendMessage, sendSmsQueueName } from './workers/send-sms.worker';

import { SendMessageService } from './services/send-sms.service';

@Module({
  imports: [BullModule.registerQueue({ name: sendSmsQueueName })],
  providers: [SendMessage, SendMessageService],
  exports: [SendMessageService],
})
export class CommonModule {}
