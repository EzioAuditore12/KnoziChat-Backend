import { ZodValidationPipe, ZodSerializerInterceptor } from 'nestjs-zod';
import { APP_PIPE, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ZodHttpExceptionFilter } from './common/filters/zod-http-excpetion-filter';
import { ConfigModule } from '@nestjs/config';

import { DbModule } from './db/db.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [ConfigModule.forRoot(), DbModule, UserModule],
  controllers: [AppController],
  providers: [
    AppService,
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
