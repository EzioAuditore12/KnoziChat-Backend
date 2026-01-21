import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';

import { PullChangesRequestDto } from './dto/pull-changes/pull-changes-request.dto';
import type { AuthRequest } from 'src/auth/types/auth-jwt-payload';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiHeader, ApiResponse } from '@nestjs/swagger';
import { PullChangesResponseDto } from './dto/pull-changes/pull-changes-response.dto';
import { PullChangeService } from './services/pull-changes.service';
import { PushChangesResponseDto } from './dto/push-changes/push-changes-response.dto';
import { PushChangesService } from './services/push-changes.service';
import { PushChangesRequestDto } from './dto/push-changes/push-changes-request.dto';

@Controller('sync')
export class SyncController {
  constructor(
    private readonly pullChangesService: PullChangeService,
    private readonly pushChangesService: PushChangesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('pull')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer JWT token',
    required: true,
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiResponse({ type: PullChangesResponseDto })
  async pullChanges(
    @Req() req: AuthRequest,
    @Body() pullChangesRequestDto: PullChangesRequestDto,
  ) {
    const userId = req.user.id;

    return await this.pullChangesService.pullChanges(
      userId,
      pullChangesRequestDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('push')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer JWT token',
    required: true,
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiResponse({ type: PushChangesResponseDto })
  async push(
    @Req() req: AuthRequest,
    @Body() pushChangesRequestDto: PushChangesRequestDto,
  ) {
    const userId = req.user.id;

    return await this.pushChangesService.pushChanges(
      userId,
      pushChangesRequestDto,
    );
  }
}
