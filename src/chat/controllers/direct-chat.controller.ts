import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateDirectChatDto } from '../dto/create-direct-chat.dto';
import { DirectChatService } from '../services/direct-chat.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { AuthRequest } from 'src/auth/types/auth-jwt-payload';

@Controller('chat')
@ApiTags('Chat')
export class DirectChatController {
  constructor(private readonly directDhatService: DirectChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Start a chat' })
  @ApiBody({ type: CreateDirectChatDto })
  async create(
    @Req() req: AuthRequest,
    @Body() createDirectChatDto: CreateDirectChatDto,
  ) {
    return await this.directDhatService.create(
      req.user.id,
      createDirectChatDto,
    );
  }
}
