import { WorkerHost, Processor, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import Zavu from '@zavudev/sdk';

process.loadEnvFile();

export interface SendMessageJobData {
  recipient: string;
  message: string;
}

export const SEND_SMS_QUEUE_NAME = 'send-message';

@Processor(SEND_SMS_QUEUE_NAME)
export class SendMessage extends WorkerHost {
  private readonly zavu = new Zavu({ apiKey: process.env.ZAVU_API_KEY });

  public async sendEmail(recipient: string, message: string): Promise<boolean> {
    try {
      const response = await this.zavu.messages.send({
        to: recipient,
        subject: 'Otp for KnoziChat',
        text: message,
        channel: 'email',
      });

      console.log(response);

      return true;
    } catch (err) {
      console.error('Zavu failed:', err);
      return false;
    }
  }

  async process(job: Job<SendMessageJobData>): Promise<any> {
    const { recipient, message } = job.data;

    await job.updateProgress(5);

    if (!recipient || !message) {
      await job.updateProgress(100);
      return {
        success: false,
        reason: 'Invalid payload',
      };
    }

    await job.updateProgress(25);

    const ok = await this.sendEmail(recipient, message);

    await job.updateProgress(ok ? 100 : 90);

    return {
      success: ok,
      recipient,
    };
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job) {
    console.log(`Job with id ${job.id}, ${job.progress as number}% completed`);
  }

  @OnWorkerEvent('active')
  onAdded(job: Job) {
    console.log('Got a new job', job.id);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    console.log('Job completed with', job.id);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job) {
    console.log('Job failed with ', job.id);
    console.log('Attempted Number', job.attemptsMade);
  }
}
