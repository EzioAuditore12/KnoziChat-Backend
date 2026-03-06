import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

import { chatsGroupSchema } from 'src/chat/dto/group/chats-group/chats-group.dto';

export const chatsGroupSyncSchema = chatsGroupSchema.extend({
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const chatsGroupSyncChangeSchema = z.object({
  created: chatsGroupSyncSchema.array(),
  updated: chatsGroupSyncSchema.array(),
  deleted: z.array(z.string()),
});

export class ChatsGroupSyncDto extends createZodDto(chatsGroupSyncSchema) {}

export class ChatsGroupSyncChangeDto extends createZodDto(
  chatsGroupSyncChangeSchema,
) {}
