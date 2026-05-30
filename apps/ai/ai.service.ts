import { Injectable, Inject, OnModuleInit } from '@nestjs/common';

import type { ClientGrpc } from '@nestjs/microservices';

import { AIServiceClient } from './generated/ai';
import { ProcessQueryDto } from './dto/process-query.dto';

@Injectable()
export class AiService implements OnModuleInit {
  private aiService: AIServiceClient;

  constructor(
    @Inject('AI_PACKAGE')
    private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.aiService = this.client.getService<AIServiceClient>('AIService');
  }

  askAI(prompt: string) {
    return this.aiService.askAi({
      prompt,
    });
  }

  processQuery(
    processQueryDto: ProcessQueryDto,
    userId: string,
    username: string,
  ) {
    return this.aiService.processQuery({
      ...processQueryDto,
      group: {
        ...processQueryDto.group,
        groupId: BigInt(processQueryDto.group.groupId),
      },
      chats: processQueryDto.chats || [],
      userId,
      username,
    });
  }
}
