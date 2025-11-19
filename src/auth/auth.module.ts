import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { BlackListedRefreshToken } from './entities/blacklist-refresh-token.entity';

import { RegisterController } from './controllers/register.controller';
import { LoginController } from './controllers/login.controller';
import { RefreshController } from './controllers/refresh.controller';

import { UserAuthService } from './services/user-auth.service';
import { TokenService } from './services/tokens.service';
import { RefreshService } from './services/refresh.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.stratergy';
import { UserService } from 'src/user/user.service';
import jwtConfig from './configs/jwt.config';
import { ConfigModule } from '@nestjs/config';
import refreshJwtConfig from './configs/refresh-jwt.config';
import { User } from 'src/user/entities/user.entity';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([BlackListedRefreshToken, User]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
  ],
  controllers: [RegisterController, LoginController, RefreshController],
  providers: [
    UserService,
    JwtStrategy,
    RefreshJwtStrategy,
    UserAuthService,
    TokenService,
    RefreshService,
  ],
})
export class AuthModule {}
