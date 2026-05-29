import { Injectable, Inject, OnModuleInit } from '@nestjs/common';

import type { ClientGrpc } from '@nestjs/microservices';

import { AIServiceClient } from './generated/ai';

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
    processQueryDto: import('./dto/process-query.dto').ProcessQueryDto,
    userId: string,
    username: string,
  ) {
    return this.aiService.processQuery({
      ...processQueryDto,
      chats: processQueryDto.chats || [],
      userId,
      username,
    });
  }
}
