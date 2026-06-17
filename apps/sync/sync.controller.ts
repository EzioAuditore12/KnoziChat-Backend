import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { SyncService } from './sync.service';
import { JwtAuthGuard } from 'apps/auth/guards/jwt-auth.guard';
import { ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiAuthHeader } from 'apps/common/decorators/swagger/api-auth-header.decorator';
import { PullChangesResponseDto } from './dto/pull-changes/pull-changes-response.dto';
import type { AuthRequest } from 'apps/auth/types/auth-jwt-payload';
import { PullChangesRequestDto } from './dto/pull-changes/pull-changes-request.dto';

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
