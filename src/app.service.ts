import { BadRequestException, Injectable } from '@nestjs/common';
import { Expo } from 'expo-server-sdk';

import { PushNotificationDto } from './common/dto/push-notification.dto';

@Injectable()
export class AppService {
  constructor(private readonly expo: Expo) {}

  getHello(): string {
    return 'Hello World!';
  }

  async pushNotification(pushNotificationDto: PushNotificationDto) {
    const { expoPushToken, title, body, metadata } = pushNotificationDto;

    if (!Expo.isExpoPushToken(expoPushToken))
      throw new BadRequestException('Given token is invalid');

    const tickets = await this.expo.sendPushNotificationsAsync([
      {
        to: expoPushToken,
        sound: 'default',
        title,
        body,
        data: metadata,
      },
    ]);

    return tickets;
  }
}
