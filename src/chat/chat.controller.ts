import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { StartNewConversationDto } from './dto/one-to-one/start-new-conversation/start-new-conversation.dto';
import { ChatsOneToOneService } from './services/one-to-one/chats-one-to-one.service';
import {
  ApiAcceptedResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiResponse,
} from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { AuthRequest } from 'src/auth/types/auth-jwt-payload';
import { StartNewConversationResponseDto } from './dto/one-to-one/start-new-conversation/start-new-conversation-response.dto';
import { ConversationGroupDto } from './dto/group/conversation-group/conversation-group.dto';
import { CreateConversationGroupDto } from './dto/group/conversation-group/create-conversation.dto';
import { ConversationGroupService } from './services/group/conversation-group.service';
import { ChatGateway } from './chat.gateway';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatsOneToOneService: ChatsOneToOneService,
    private readonly conversationGroupService: ConversationGroupService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer JWT token',
    required: true,
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiCreatedResponse({ type: StartNewConversationResponseDto })
  async create(
    @Req() req: AuthRequest,
    @Body() startNewConversationDto: StartNewConversationDto,
    @Res() reply: FastifyReply,
  ) {
    const userId = req.user.id;

    const result = await this.chatsOneToOneService.startNewConversation(
      userId,
      startNewConversationDto,
    );

    const { receiverId, ...inserChatDto } = result;

    this.chatGateway.server
      .to(`conversation:${result.conversationId}`)
      .emit('message:receive', inserChatDto);

    this.chatGateway.server
      .to(`user:${receiverId}`)
      .except(`conversation:${result.conversationId}`)
      .emit('message:receive', inserChatDto);

    return reply.status(HttpStatus.CREATED).send(result);
  }

  @UseGuards(JwtAuthGuard)
  @Post('group')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer JWT token',
    required: true,
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiCreatedResponse({ type: ConversationGroupDto })
  async createGroup(
    @Req() req: AuthRequest,
    @Body() createConversationGroupDto: CreateConversationGroupDto,
    @Res() reply: FastifyReply,
  ) {
    const userId = req.user.id;

    const result = await this.conversationGroupService.create(
      userId,
      createConversationGroupDto,
    );

    const participants = result.participants.filter((id) => id !== userId);
    const participantRooms = participants.map((id) => `user:${id}`);

    if (participantRooms.length > 0) {
      this.chatGateway.server
        .to(participantRooms)
        .emit('conversation-group:created', result);
    }

    return reply.status(HttpStatus.CREATED).send(result);
  }

  @Get('group/:id')
  @ApiAcceptedResponse({ type: ConversationGroupDto })
  public async getGroup(@Param('id') id: string, @Res() reply: FastifyReply) {
    const result = await this.conversationGroupService.get(BigInt(id));

    return reply.status(HttpStatus.ACCEPTED).send(result);
  }
}
