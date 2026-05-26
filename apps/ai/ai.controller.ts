import { Controller, Get, Query } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get()
  askAI(@Query('prompt') prompt: string) {
    return this.aiService.askAI(prompt);
  }
}
