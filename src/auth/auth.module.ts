import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { SEND_SMS_QUEUE_NAME } from './workers/send-sms.worker';
import { UserAuthService } from './services/user-auth.service';
import { TokenService } from './services/tokens.service';
import { RefreshService } from './services/refresh.service';
import { BlackListedRefreshToken } from './entities/blacklist-refresh-token.entity';
import jwtConfig from './configs/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import refreshJwtConfig from './configs/refresh-jwt.config';
import { RegisterController } from './controllers/register.controller';
import { LoginController } from './controllers/login.controller';
import { RefreshController } from './controllers/refresh.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.stratergy';
import { MulterModule } from '@webundsoehne/nest-fastify-file-upload';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    UserModule,
    BullModule.registerQueue({ name: SEND_SMS_QUEUE_NAME }),
    TypeOrmModule.forFeature([BlackListedRefreshToken]),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    MulterModule.register({
      dest: './public/temp',
    }),
  ],
  controllers: [RegisterController, LoginController, RefreshController],
  providers: [
    JwtStrategy,
    RefreshJwtStrategy,
    UserAuthService,
    TokenService,
    RefreshService,
  ],
})
export class AuthModule {}
