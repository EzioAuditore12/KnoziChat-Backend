import {
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Req,
  UseGuards,
  Sse,
  MessageEvent,
  Body,
} from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ProcessQueryDto } from './dto/process-query.dto';
import { SeedChatsDto } from './dto/seed-chats.dto';
import { JwtAuthGuard } from 'apps/auth/guards/jwt-auth.guard';
import type { AuthRequest } from 'apps/auth/types/auth-jwt-payload';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ProcessQueryResponse } from './generated/ai';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get()
  askAI(@Query('prompt') prompt: string) {
    return this.aiService.askAI(prompt);
  }

  @UseGuards(JwtAuthGuard)
  @Sse('send')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer JWT token',
    required: true,
  })
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
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer JWT token',
    required: true,
  })
  seedChats(@Body() seedChatsDto: SeedChatsDto) {
    return this.aiService.seedChats(seedChatsDto);
  }
}
