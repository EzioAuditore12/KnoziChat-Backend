import { WorkerHost, Processor, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';

export interface SendMessageJobData {
  recipient: string;
  message: string;
}

export const sendSmsQueueName = 'send-message';

type TextBeeApiResponses =
  | {
      data: {
        success: true;
        message: string;
        smsBatchId: string;
        recipientCount: number;
      };
    }
  | {
      data: {
        error: string;
      };
    };

@Processor(sendSmsQueueName)
export class SendMessage extends WorkerHost {
  async sendSMS(recipient: string, message: string): Promise<boolean> {
    try {
      const res = await fetch(
        `${process.env.TEXTBEE_BASE_URL}/gateway/devices/${process.env.TEXTBEE_DEVICE_ID}/send-sms`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.TEXTBEE_API_KEY!,
          },
          body: JSON.stringify({
            recipients: [recipient],
            message,
          }),
        },
      );

      const json = (await res.json()) as TextBeeApiResponses;

      console.log(json);

      if ('data' in json && 'success' in json.data && json.data.success) {
        return true;
      }
      console.error('TextBee error response:', json);
      return false;
    } catch (err) {
      console.error('TextBee request failed:', err);
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

    const ok = await this.sendSMS(recipient, message);

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
