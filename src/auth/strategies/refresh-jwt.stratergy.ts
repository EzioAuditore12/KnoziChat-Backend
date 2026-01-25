import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

import { AuthJwtPayload } from '../types/auth-jwt-payload';

import refreshJwtConfig from '../configs/refresh-jwt.config';

import { RefreshService } from '../services/refresh.service';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    private refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
    private refreshService: RefreshService,
  ) {
    if (!refreshJwtConfiguration.secret) {
      throw new Error('Refresh JWT secret is not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: refreshJwtConfiguration.secret,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: FastifyRequest, payload: AuthJwtPayload) {
    const body = req.body as Record<string, any>;
    const userId = payload.sub;
    const refreshToken = body['refreshToken'] as string;

    const isBlackListedRefreshToken =
      await this.refreshService.findBlackListedRefreshToken(refreshToken);

    if (isBlackListedRefreshToken)
      throw new UnauthorizedException('Given refresh token is blacklisted');

    return {
      id: userId,
      refreshToken,
      issuedAt: new Date(payload.iat * 1000),
      expiredAt: new Date(payload.exp * 1000),
    };
  }
}
