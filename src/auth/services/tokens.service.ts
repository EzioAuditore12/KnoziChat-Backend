import type { ConfigType } from '@nestjs/config';
import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthJwtPayload } from '../types/auth-jwt-payload';

import refreshJwtConfig from '../configs/refresh-jwt.config';
import { TokensDto } from '../dto/tokens.dto';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}

  async generateTokens(userId: string): Promise<TokensDto> {
    const payload: Pick<AuthJwtPayload, 'sub'> = { sub: userId };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, this.refreshTokenConfig);
    return { accessToken, refreshToken };
  }
}
