import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RefreshJwtAuthGuard } from '../guards/refresh-auth.guard';

import { RefreshTokensDto } from '../dto/refresh-token.dto';

import type { RefreshTokenStratergyReqParameters } from '../types/auth-jwt-payload';

import { RefreshService } from '../services/refresh.service';

@ApiTags('Authentication')
@Controller('auth')
export class RefreshController {
  constructor(private readonly refreshService: RefreshService) {}

  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh Tokens',
    description:
      'Here After sending authenticated refresh token in body, bot access and refesh token will be generated',
  })
  @ApiBody({ type: RefreshTokensDto })
  refreshTokens(@Req() req: RefreshTokenStratergyReqParameters) {
    return this.refreshService.refreshToken({
      userId: req.user.id,
      refreshToken: req.user.refreshToken,
      expiredAt: req.user.expiredAt,
      createdAt: req.user.issuedAt,
    });
  }
}
