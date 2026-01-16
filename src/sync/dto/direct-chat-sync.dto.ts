import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const directChatSyncSchema = z.object({
  id: z.string(),
  conversation_id: z.string(),
  text: z.string().min(1).max(1000),
  mode: z.enum(['SENT', 'RECEIVED']),
  is_delivered: z.boolean(),
  is_seen: z.boolean(),
  created_at: z.number(),
  updated_at: z.number(),
});

export class DirectChatSyncDto extends createZodDto(directChatSyncSchema) {}
