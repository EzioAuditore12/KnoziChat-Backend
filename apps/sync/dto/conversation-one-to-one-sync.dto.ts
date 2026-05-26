import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

import { conversationOneToOneSchema } from 'apps/chat/dto/one-to-one/conversation-one-to-one/conversation-one-to-one.dto';

export const conversationOneToOneSyncSchema = conversationOneToOneSchema
  .omit({ lastSeenAt: true, participant1: true, participant2: true })
  .extend({
    userId: z.uuid(),
    createdAt: z.number(),
    updatedAt: z.number(),
    myLastSeenAt: z.number(),
    theirLastSeenAt: z.number(),
  });

export const conversationOneToOneSyncChangeSchema = z.object({
  created: conversationOneToOneSyncSchema.array(),
  updated: conversationOneToOneSyncSchema.array(),
  deleted: z.array(z.string()),
});

export class ConversationOneToOneSyncDto extends createZodDto(
  conversationOneToOneSyncSchema,
) {}

export class ConversationOneToOneSyncChangeDto extends createZodDto(
  conversationOneToOneSyncChangeSchema,
) {}
