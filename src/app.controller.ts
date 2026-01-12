import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { ApiBody } from '@nestjs/swagger';

import { AppService } from './app.service';

import { PushNotificationDto } from './common/dto/push-notification.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  @ApiBody({ type: PushNotificationDto })
  async pushNotification(
    @Body() pushNotificationDto: PushNotificationDto,
    @Res() reply: FastifyReply,
  ) {
    const tickets = await this.appService.pushNotification(pushNotificationDto);

    return reply.status(HttpStatus.OK).send(tickets);
  }
}
