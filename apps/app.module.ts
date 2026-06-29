import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';

import { AiModule } from './ai/ai.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { ZodHttpExceptionFilter } from './common/filters/zod-http-excpetion-filter';
import { bullMQConfig } from './configs/bull-mq.config';
import { createCacheOptions } from './configs/cache.config';
import { mongooseConfig } from './configs/db/monoose.config';
import { typeOrmConfig } from './configs/db/typeorm.config';
import { throttlerConfig } from './configs/throttler.config';
import { SyncModule } from './sync/sync.module';
import { UploadsModule } from './uploads/uploads.module';
import { UserModule } from './user/user.module';

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
    AiModule,
    UserModule,
    AuthModule,
    ChatModule,
    SyncModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ZodHttpExceptionFilter,
    },
  ],
})
export class AppModule {}
