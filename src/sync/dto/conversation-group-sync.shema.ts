import { z } from 'zod';

import { conversationGroupSchema } from 'src/chat/dto/group/conversation-group/conversation-group.dto';
import { createZodDto } from 'nestjs-zod';

const conversationGroupSyncShcema = conversationGroupSchema
  .omit({ participants: true, admins: true })
  .extend({
    participantIds: z.uuid().array(),
    adminIds: z.uuid().array(),
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
