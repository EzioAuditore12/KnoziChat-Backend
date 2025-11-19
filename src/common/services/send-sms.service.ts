import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  sendSmsQueueName,
  type SendMessageJobData,
} from '../workers/send-sms.worker';

@Injectable()
export class SendMessageService {
  constructor(@InjectQueue(sendSmsQueueName) private sendMessageQueue: Queue) {}
  async sendMessage({ message, recipient }: SendMessageJobData) {
    await this.sendMessageQueue.add('process', {
      message,
      recipient,
    });
  }
}
