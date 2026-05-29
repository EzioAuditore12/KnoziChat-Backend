import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ProcessQueryDto } from './dto/process-query.dto';
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
  processQuery(
    @Req() req: AuthRequest,
    @Body() processQueryDto: ProcessQueryDto,
  ) {
    return this.aiService.processQuery(
      processQueryDto,
      req.user.id,
      req.user.username,
    );
  }
}
