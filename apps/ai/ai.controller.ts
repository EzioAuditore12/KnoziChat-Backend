import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ProcessQueryDto } from './dto/process-query.dto';
import { SeedChatsDto } from './dto/seed-chats.dto';
import { JwtAuthGuard } from 'apps/auth/guards/jwt-auth.guard';
import type { AuthRequest } from 'apps/auth/types/auth-jwt-payload';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get()
  askAI(@Query('prompt') prompt: string) {
    return this.aiService.askAI(prompt);
  }

  @UseGuards(JwtAuthGuard)
  @Post('send')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer JWT token',
    required: true,
  })
  async processQuery(
    @Req() req: AuthRequest,
    @Body() processQueryDto: ProcessQueryDto,
  ) {
    const userId = req.user.id;
    const userName = req.user.username;

    Logger.log(userId);

    return await this.aiService.processQuery(processQueryDto, userId, userName);
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
