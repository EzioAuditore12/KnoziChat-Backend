import { conversationGroupSchema } from 'apps/chat/dto/group/conversation-group/conversation-group.dto';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const conversationGroupSyncShcema = conversationGroupSchema.extend({
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const conversationGroupSyncChangeSchema = z.object({
  created: conversationGroupSyncShcema.array(),
  updated: conversationGroupSyncShcema.array(),
  deleted: z.array(z.string()),
});

export class ConversationGroupSyncDto extends createZodDto(
  conversationGroupSyncShcema,
) {}

export class ConversationGroupSyncChangeDto extends createZodDto(
  conversationGroupSyncChangeSchema,
) {}
