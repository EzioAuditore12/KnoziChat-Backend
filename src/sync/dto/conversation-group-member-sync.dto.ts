import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

import { conversationGroupMemberSchema } from 'src/chat/dto/group/conversation-group/conversation-group-member.dto';

export const conversationGroupMemberSyncSchema =
  conversationGroupMemberSchema.extend({
    createdAt: z.number(),
    updatedAt: z.number(),
    deletedAt: z.number().nullable(),
  });

export const conversationGroupMemberSyncChangeSchema = z.object({
  created: conversationGroupMemberSyncSchema.array(),
  updated: conversationGroupMemberSyncSchema.array(),
  deleted: z.array(z.string()),
});

export class ConversationGroupMemberSyncDto extends createZodDto(
  conversationGroupMemberSyncSchema,
) {}

export class ConversationGroupMemberSyncChangeDto extends createZodDto(
  conversationGroupMemberSyncChangeSchema,
) {}
