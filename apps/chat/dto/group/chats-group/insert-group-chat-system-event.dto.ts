import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { chatsGroupSchema } from './chats-group.dto';

export const insertGroupChatsSystemEventSchema = chatsGroupSchema
  .omit({
    content: true,
    contentType: true,
    attachmentUrl: true,
  })
  .partial({ id: true, createdAt: true, updatedAt: true, metadata: true })
  .extend({ contentType: z.literal('system') });

export class InsertGroupChatsSystemEventDto extends createZodDto(
  insertGroupChatsSystemEventSchema,
) {}
