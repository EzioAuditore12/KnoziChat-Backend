import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConversationGroupService } from '../services/group/conversation-group.service';
import { ChatGateway } from '../chat.gateway';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  ApiAcceptedResponse,
  ApiBody,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import type { AuthRequest } from 'src/auth/types/auth-jwt-payload';
import type { FastifyReply } from 'fastify';
import { CreateConversationGroupDto } from '../dto/group/conversation-group/create-conversation/create-conversation.dto';
import { ConversationGroupDto } from '../dto/group/conversation-group/conversation-group.dto';
import { ConversationGroupMemberDto } from '../dto/group/conversation-group/conversation-group-member.dto';
import { ConversationGroupMemberService } from '../services/group/conversation-group-member.service';
import { ConversationGroupOrchestratorService } from '../services/conversation-group-orchestrator.service';
import { CreateConversationGroupResponseDto } from '../dto/group/conversation-group/create-conversation/create-conversation-responses.dto';

@Controller('chat/group')
export class ChatGroupController {
  constructor(
    private readonly conversationGroupService: ConversationGroupService,
    private readonly conversationGroupMemberService: ConversationGroupMemberService,

    private readonly conversationGroupOrchestratorService: ConversationGroupOrchestratorService,

    private readonly chatGateway: ChatGateway,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({
    type: CreateConversationGroupResponseDto,
  })
  @Post()
  async create(
    @Req() req: AuthRequest,
    @Body()
    createConversationGroupDto: CreateConversationGroupDto,
    @Res() reply: FastifyReply,
  ) {
    const userId = req.user.id;

    const result = await this.conversationGroupService.create(
      userId,
      createConversationGroupDto,
    );

    /**
     * Active participants except creator
     */
    const participants = result.participantIds.filter((id) => id !== userId);

    /**
     * Personal rooms
     */
    const participantRooms = participants.map((id) => `user:${id}`);

    /**
     * Group metadata
     */
    const conversationCreatedPayload = {
      id: result.id,
      adminIds: result.adminIds,
      avatar: result.avatar,
      name: result.name,
      participantIds: result.participantIds,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };

    /**
     * Sidebar/conversation list sync
     */
    if (participantRooms.length > 0) {
      this.chatGateway.server
        .to(participantRooms)
        .emit('conversation-group:created', conversationCreatedPayload);
    }

    /**
     * First timeline item
     */
    if (participantRooms.length > 0) {
      this.chatGateway.server
        .to(participantRooms)
        .emit('message-group:receive', result.chat);
    }

    return reply.status(HttpStatus.CREATED).send(result);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('member/:id')
  public async leaveGroup(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Res() reply: FastifyReply,
  ) {
    const userId = req.user.id;

    const groupId = BigInt(id);

    const result =
      await this.conversationGroupOrchestratorService.leaveConversation(
        groupId,
        userId,
      );

    /**
     * Personal rooms
     */
    const participantRooms = result.participantIds.map(
      (participantId) => `user:${participantId}`,
    );

    this.chatGateway.server
      .to(`conversation:${id}`)
      .emit('message-group:receive', result.memberLeftChat);

    if (participantRooms.length > 0) {
      this.chatGateway.server
        .to(participantRooms)
        .emit('message-group:receive', result.memberLeftChat);
    }

    if (result.adminChangedChat) {
      this.chatGateway.server
        .to(`conversation:${id}`)
        .emit('message-group:receive', result.adminChangedChat);

      if (participantRooms.length > 0) {
        this.chatGateway.server
          .to(participantRooms)
          .emit('message-group:receive', result.adminChangedChat);
      }
    }

    return reply.status(HttpStatus.ACCEPTED).send({
      userId,
      deletedAt: result.deletedAt,
      newAdminId: result.newAdminId ?? null,
    });
  }

  @Get('members/:id')
  @ApiAcceptedResponse({ type: [ConversationGroupMemberDto] })
  public async getGroupMembers(
    @Param('id') id: string,
    @Res() reply: FastifyReply,
  ) {
    const result = await this.conversationGroupMemberService.getMembers(
      BigInt(id),
    );

    return reply.status(HttpStatus.ACCEPTED).send(result);
  }
}
