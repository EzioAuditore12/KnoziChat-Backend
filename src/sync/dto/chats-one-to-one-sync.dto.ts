import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

import { chatsOneToOneSchema } from 'src/chat/dto/one-to-one/chats-one-to-one/chats-one-to-one.dto';

export const chatsOneToOneSyncSchema = chatsOneToOneSchema
  .omit({ senderId: true })
  .extend({
    mode: z.enum(['SENT', 'RECEIVED']),
    createdAt: z.number(),
    updatedAt: z.number(),
  });

export const chatsOneToOneSyncChangeSchema = z.object({
  created: chatsOneToOneSyncSchema.array(),
  updated: chatsOneToOneSyncSchema.array(),
  deleted: z.array(z.string()),
});

export class ChatsOneToOneSyncDto extends createZodDto(
  chatsOneToOneSyncSchema,
) {}

export class ChatsOneToOneSyncChangeDto extends createZodDto(
  chatsOneToOneSyncChangeSchema,
) {}
