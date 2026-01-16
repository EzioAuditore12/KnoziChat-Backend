import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

import { directChatSyncSchema } from '../direct-chat-sync.dto';

export const directChatsChangeSchema = z.object({
  created: z.array(directChatSyncSchema),
  updated: z.array(directChatSyncSchema),
  deleted: z.array(z.string()),
});

export class DirectChatsChangeDto extends createZodDto(
  directChatsChangeSchema,
) {}
