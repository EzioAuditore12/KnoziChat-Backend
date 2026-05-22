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
import { ChatsOneToOneService } from '../services/one-to-one/chats-one-to-one.service';
import { ChatGateway } from '../chat.gateway';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiCreatedResponse, ApiHeader } from '@nestjs/swagger';
import { StartNewConversationResponseDto } from '../dto/one-to-one/start-new-conversation/start-new-conversation-response.dto';
import type { AuthRequest } from 'src/auth/types/auth-jwt-payload';
import { StartNewConversationDto } from '../dto/one-to-one/start-new-conversation/start-new-conversation.dto';
import type { FastifyReply } from 'fastify';

@Controller('chat')
export class ChatDirectController {
  constructor(
    private readonly chatsOneToOneService: ChatsOneToOneService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post(':id')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer JWT token',
    required: true,
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
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
