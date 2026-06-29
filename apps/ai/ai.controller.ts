import {
  Body,
  Controller,
  Get,
  Logger,
  MessageEvent,
  Post,
  Query,
  Req,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'apps/auth/guards/jwt-auth.guard';
import type { AuthRequest } from 'apps/auth/types/auth-jwt-payload';
import { ApiAuthHeader } from 'apps/common/decorators/swagger/api-auth-header.decorator';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AiService } from './ai.service';
import { ProcessQueryDto } from './dto/process-query.dto';
import { SeedChatsDto } from './dto/seed-chats.dto';
import { ProcessQueryResponse } from './generated/ai';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get()
  @ApiOperation({ summary: 'Ask AI a prompt' })
  askAI(@Query('prompt') prompt: string) {
    return this.aiService.askAI(prompt);
  }

  @UseGuards(JwtAuthGuard)
  @Sse('send')
  @ApiOperation({
    summary: 'Process AI query via SSE',
    description:
      'Establishes a Server-Sent Events (SSE) connection to stream back AI responses in real-time.',
  })
  @ApiAuthHeader()
  async processQuery(
    @Req() req: AuthRequest,
    @Query() processQueryDto: ProcessQueryDto,
  ): Promise<Observable<MessageEvent>> {
    const userId = req.user.id;
    const userName = req.user.username;

    Logger.log(userId);

    const stream = await this.aiService.processQuery(
      processQueryDto,
      userId,
      userName,
    );
    return (stream as Observable<ProcessQueryResponse>).pipe(
      map(
        (chunk: ProcessQueryResponse) =>
          ({ data: { response: chunk.response } }) as MessageEvent,
      ),
      catchError((err) => {
        Logger.error(`Stream error: ${err.message}`, err.stack);
        return of({
          data: { error: err.message || 'Stream processing failed' },
        } as MessageEvent);
      }),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('seed')
  @ApiOperation({
    summary: 'Seed AI chats',
    description:
      'Seeds predefined AI chat history into the database for testing or initialization.',
  })
  @ApiAuthHeader()
  seedChats(@Body() seedChatsDto: SeedChatsDto) {
    return this.aiService.seedChats(seedChatsDto);
  }
}
