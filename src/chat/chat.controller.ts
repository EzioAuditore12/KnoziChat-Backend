import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { DirectChatService } from './services/direct-chat.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiHeader, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateDirectChatDto } from './dto/direct-chat/create-direct-chat.dto';
import type { AuthRequest } from 'src/auth/types/auth-jwt-payload';
import { ConversationDto } from './dto/conversation.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly directChatService: DirectChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/direct')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer JWT token',
    required: true,
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiOperation({ summary: 'Start a chat' })
  @ApiResponse({ type: ConversationDto })
  async create(
    @Body() createDirectChatDto: CreateDirectChatDto,
    @Req() req: AuthRequest,
  ) {
    return await this.directChatService.create(
      req.user.id,
      createDirectChatDto,
    );
  }
}
