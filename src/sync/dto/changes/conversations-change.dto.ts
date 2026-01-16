import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

import { conversationSyncSchema } from '../conversation-sync.dto';

export const conversationsChangeSchema = z.object({
  created: z.array(conversationSyncSchema),
  updated: z.array(conversationSyncSchema),
  deleted: z.array(z.string()),
});

export class ConversationsChangeDto extends createZodDto(
  conversationsChangeSchema,
) {}
