import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { SyncService } from './sync.service';
import { PullChangesRequestDto } from './dto/pull-changes/pull-changes-request.dto';
import type { AuthRequest } from 'src/auth/types/auth-jwt-payload';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiResponse } from '@nestjs/swagger';
import { PullChangesResponseDto } from './dto/pull-changes/pull-changes-response.dto';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @UseGuards(JwtAuthGuard)
  @Post('pull')
  async pullChanges(
    @Req() req: AuthRequest,
    @Body() pullChangesRequestDto: PullChangesRequestDto,
  ) {
    const userId = req.user.id;

    return await this.syncService.pullChanges(userId, pullChangesRequestDto);
  }
}
