import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'apps/auth/guards/jwt-auth.guard';
import type { AuthRequest } from 'apps/auth/types/auth-jwt-payload';
import { ApiAuthHeader } from 'apps/common/decorators/swagger/api-auth-header.decorator';

import { PullChangesRequestDto } from './dto/pull-changes/pull-changes-request.dto';
import { PullChangesResponseDto } from './dto/pull-changes/pull-changes-response.dto';
import { SyncService } from './sync.service';

@ApiTags('Sync')
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @UseGuards(JwtAuthGuard)
  @Post('pull')
  @ApiOperation({
    summary: 'Pull sync changes',
    description:
      'Retrieves incremental state changes for offline-first synchronization using watermarks.',
  })
  @ApiAuthHeader()
  @ApiResponse({ type: PullChangesResponseDto })
  async pullChanges(
    @Req() req: AuthRequest,
    @Body() pullChangesRequestDto: PullChangesRequestDto,
  ) {
    const userId = req.user.id;

    return await this.syncService.pullChanges(userId, pullChangesRequestDto);
  }
}
