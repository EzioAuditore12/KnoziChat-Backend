import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@webundsoehne/nest-fastify-file-upload';
import { UploadsModule } from 'apps/uploads/uploads.module';
import { UserModule } from 'apps/user/user.module';

import jwtConfig from './configs/jwt.config';
import refreshJwtConfig from './configs/refresh-jwt.config';
import { LoginController } from './controllers/login.controller';
import { RefreshController } from './controllers/refresh.controller';
import { RegisterController } from './controllers/register.controller';
import { BlackListedRefreshToken } from './entities/blacklist-refresh-token.entity';
import { RefreshService } from './services/refresh.service';
import { TokenService } from './services/tokens.service';
import { UserAuthService } from './services/user-auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.stratergy';
import { SEND_SMS_QUEUE_NAME } from './workers/send-sms.worker';

@Module({
  imports: [
    UserModule,
    UploadsModule,
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
