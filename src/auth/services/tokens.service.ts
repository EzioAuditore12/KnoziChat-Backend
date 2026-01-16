import type { ConfigType } from '@nestjs/config';
import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthJwtPayload } from '../types/auth-jwt-payload';

import refreshJwtConfig from '../configs/refresh-jwt.config';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}

  generateTokens(userId: string) {
    const payload: Pick<AuthJwtPayload, 'sub'> = { sub: userId };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, this.refreshTokenConfig);
    return { accessToken, refreshToken };
  }
}
