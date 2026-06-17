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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConversationGroupService } from '../services/group/conversation-group.service';
import { ChatGateway } from '../chat.gateway';
import { JwtAuthGuard } from 'apps/auth/guards/jwt-auth.guard';
import {
  ApiAcceptedResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthRequest } from 'apps/auth/types/auth-jwt-payload';
import type { FastifyReply } from 'fastify';
import { CreateConversationGroupDto } from '../dto/group/conversation-group/create-conversation/create-conversation.dto';
import { ConversationGroupDto } from '../dto/group/conversation-group/conversation-group.dto';
import { ConversationGroupMemberDto } from '../dto/group/conversation-group/conversation-group-member.dto';
import { ConversationGroupMemberService } from '../services/group/conversation-group-member.service';
import { ConversationGroupOrchestratorService } from '../services/conversation-group-orchestrator.service';
import { CreateConversationGroupResponseDto } from '../dto/group/conversation-group/create-conversation/create-conversation-responses.dto';
import {
  FileInterceptor,
  type MulterFile,
} from '@webundsoehne/nest-fastify-file-upload';

@ApiTags('Chat Group')
@Controller('chat/group')
export class ChatGroupController {
  constructor(
    private readonly conversationGroupService: ConversationGroupService,
    private readonly conversationGroupMemberService: ConversationGroupMemberService,

    private readonly conversationGroupOrchestratorService: ConversationGroupOrchestratorService,

    private readonly chatGateway: ChatGateway,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create a new group conversation',
    description:
      'Creates a new group conversation, adds the specified participants, and notifies them via WebSockets.',
  })
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiCreatedResponse({
    type: CreateConversationGroupResponseDto,
  })
  @Post()
  async create(
    @Req() req: AuthRequest,
    @Body()
    createConversationGroupDto: CreateConversationGroupDto,

    @UploadedFile()
    avatar: MulterFile | undefined,

    @Res() reply: FastifyReply,
  ) {
    const userId = req.user.id;

    const { name, participants: chosenParticipants } =
      createConversationGroupDto;

    const result = await this.conversationGroupService.create(userId, {
      name,
      avatar,
      participants: chosenParticipants,
    });

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
  @ApiOperation({
    summary: 'Leave a group conversation',
    description:
      'Allows a user to leave a group. Reassigns the admin role if the leaving user was the only admin and notifies the group via WebSockets.',
  })
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
  @ApiOperation({ summary: 'Get members of a group conversation' })
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
