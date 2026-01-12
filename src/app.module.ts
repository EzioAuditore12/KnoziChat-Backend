import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import Expo from 'expo-server-sdk';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { throttlerConfig } from './configs/throttler.config';
import { typeOrmConfig } from './configs/db/typeorm.config';
import { mongooseConfig } from './configs/db/monoose.config';
import { bullMQConfig } from './configs/bull-mq.config';
import { createCacheOptions } from './configs/cache.config';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.registerAsync({
      useFactory: createCacheOptions,
      isGlobal: true,
    }),
    ThrottlerModule.forRoot(throttlerConfig),
    BullModule.forRoot(bullMQConfig),
    TypeOrmModule.forRoot(typeOrmConfig),
    MongooseModule.forRoot(mongooseConfig.uri!),
    CommonModule,
    UserModule,
    AuthModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    Expo,
  ],
})
export class AppModule {}
