import { chatsGroupSchema } from 'apps/chat/dto/group/chats-group/chats-group.dto';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const chatsGroupSyncSchema = chatsGroupSchema
  .omit({ attachmentUrl: true })
  .extend({
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
