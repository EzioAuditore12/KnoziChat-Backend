import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const conversationSyncSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  created_at: z.number(),
  updated_at: z.number(),
});

export class ConversationSyncDto extends createZodDto(conversationSyncSchema) {}
