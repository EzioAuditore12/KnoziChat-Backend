import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { DirectChatService } from './services/direct-chat.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiOperation } from '@nestjs/swagger';
import { CreateDirectChatDto } from './dto/direct-chat/create-direct-chat.dto';
import type { AuthRequest } from 'src/auth/types/auth-jwt-payload';

@Controller('chat')
export class ChatController {
  constructor(private readonly directChatService: DirectChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/direct')
  @ApiOperation({ summary: 'Start a chat' })
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
