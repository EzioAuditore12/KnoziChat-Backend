import {
  Body,
  Controller,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';

import { DirectChatService } from '../services/direct-chat.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateDirectChatDto } from '../dto/direct-chat/create-direct-chat.dto';
import type { AuthRequest } from 'src/auth/types/auth-jwt-payload';
import { plainToInstance } from 'class-transformer';
import { DirectMessageDto } from '../dto/direct-message.dto';

@Controller('chat/direct')
export class DirectChatController {
  constructor(private readonly directChatService: DirectChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':id')
  async create(
    @Req() req: AuthRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() createDirectChatDto: CreateDirectChatDto,
    @Res() reply: FastifyReply,
  ) {
    const senderId = req.user.id;

    const initializedChat = await this.directChatService.create(
      senderId,
      id,
      createDirectChatDto,
    );

    return reply.status(HttpStatus.CREATED).send({
      status: 'success',
      message: 'Chat Started Successfully',
      data: plainToInstance(DirectMessageDto, initializedChat, {
        excludeExtraneousValues: true,
      }),
    });
  }
}
