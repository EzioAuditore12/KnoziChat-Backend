import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const pushNotificationSchema = z.object({
  expoPushToken: z.string(),
  title: z.string().max(50),
  body: z.string().max(100),
  metadata: z.object(z.any()).optional(),
});

export class PushNotificationDto extends createZodDto(pushNotificationSchema) {}
