import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BlackListedRefreshToken } from '../entities/blacklist-refresh-token.entity';

import { TokenService } from './tokens.service';

@Injectable()
export class RefreshService {
  constructor(
    @InjectRepository(BlackListedRefreshToken)
    private blackListedRefreshTokenRepo: Repository<BlackListedRefreshToken>,
    private readonly tokenService: TokenService,
  ) {}

  async insertBlackListedRefreshToken({
    refreshToken,
    issuedAt,
    expiredAt,
  }: {
    refreshToken: string;
    issuedAt: Date;
    expiredAt: Date;
  }) {
    const insertBlaclistedToken = this.blackListedRefreshTokenRepo.create({
      refreshToken,
      createdAt: issuedAt,
      expiredAt,
    });
    await this.blackListedRefreshTokenRepo.save(insertBlaclistedToken);
  }

  async findBlackListedRefreshToken(refreshToken: string) {
    return this.blackListedRefreshTokenRepo.findOne({
      where: { refreshToken },
    });
  }

  async refreshToken({
    userId,
    expiredAt,
    createdAt,
    refreshToken,
  }: {
    userId: string;
    refreshToken: string;
    createdAt: Date;
    expiredAt: Date;
  }) {
    // Example: blacklist old token and issue new tokens
    await this.insertBlackListedRefreshToken({
      refreshToken,
      issuedAt: createdAt,
      expiredAt,
    });

    return this.tokenService.generateTokens(userId);
  }
}
