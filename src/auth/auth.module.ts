import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { SEND_SMS_QUEUE_NAME } from './workers/send-sms.worker';
import { UserAuthService } from './services/user-auth.service';
import { TokenService } from './services/tokens.service';
import { RefreshService } from './services/refresh.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlackListedRefreshToken } from './entities/blacklist-refresh-token.entity';
import { User } from 'src/user/entities/user.entity';
import jwtConfig from './configs/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import refreshJwtConfig from './configs/refresh-jwt.config';
import { RegisterController } from './controllers/register.controller';
import { LoginController } from './controllers/login.controller';
import { RefreshController } from './controllers/refresh.controller';
import { UserService } from 'src/user/user.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.stratergy';

@Module({
  imports: [
    BullModule.registerQueue({ name: SEND_SMS_QUEUE_NAME }),
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
