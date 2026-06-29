import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'apps/auth/guards/jwt-auth.guard';
import type { AuthRequest } from 'apps/auth/types/auth-jwt-payload';
import { ApiAuthHeader } from 'apps/common/decorators/swagger/api-auth-header.decorator';
import type { FastifyReply } from 'fastify';

import { ChatGateway } from '../chat.gateway';
import { StartNewConversationResponseDto } from '../dto/one-to-one/start-new-conversation/start-new-conversation-response.dto';
import { StartNewConversationDto } from '../dto/one-to-one/start-new-conversation/start-new-conversation.dto';
import { ChatsOneToOneService } from '../services/one-to-one/chats-one-to-one.service';

@ApiTags('Chat Direct')
@Controller('chat')
export class ChatDirectController {
  constructor(
    private readonly chatsOneToOneService: ChatsOneToOneService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post(':id')
  @ApiOperation({ summary: 'Start new direct conversation' })
  @ApiAuthHeader()
  @ApiCreatedResponse({ type: StartNewConversationResponseDto })
  async create(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() startNewConversationDto: StartNewConversationDto,
    @Res() reply: FastifyReply,
  ) {
    const userId = req.user.id;
    const receiverId = id;

    console.log(receiverId, startNewConversationDto, userId);

    const result = await this.chatsOneToOneService.startNewConversation(
      userId,
      receiverId,
      startNewConversationDto,
    );

    const insertChatDto = result;

    this.chatGateway.server
      .to(`conversation:${result.conversationId}`)
      .emit('message:receive', insertChatDto);

    this.chatGateway.server
      .to(`user:${receiverId}`)
      .except(`conversation:${result.conversationId}`)
      .emit('message:receive', insertChatDto);

    return reply.status(HttpStatus.CREATED).send(result);
  }
}
