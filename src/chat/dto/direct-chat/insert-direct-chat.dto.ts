import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const insertChatSchema = z.object({
  _id: z.string().regex(/^[a-f\d]{24}$/i),
  conversationId: z.string().regex(/^[a-f\d]{24}$/i),
  text: z.string().nonempty().max(1000),
  createdAt: z.iso.datetime(),
});

export class InsertChatDto extends createZodDto(insertChatSchema) {}
