import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { AiService } from './ai.service';
import { EmbedMessageRequest } from './generated/ai';

@Processor('embed-messages')
export class EmbedProcessor extends WorkerHost {
  private readonly logger = new Logger(EmbedProcessor.name);

  constructor(private readonly aiService: AiService) {
    super();
  }

  async process(job: Job<EmbedMessageRequest, any, string>): Promise<any> {
    this.logger.log(`Processing embed message job: ${job.id}`);

    try {
      const response = await this.aiService.embedMessage(job.data);
      this.logger.log(`Successfully processed embed message job: ${job.id}`);
      return response;
    } catch (error) {
      this.logger.error(
        `Error processing embed message job: ${job.id}`,
        error.stack,
      );
      throw error;
    }
  }
}
