import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const conversationSchema = z.object({
  _id: z.string(),
  participants: z.array(z.string()),
  lastMessage: z.string().optional(),
  createdAt: z.any(),
  updatedAt: z.any(),
  __v: z.number(),
});

export class ConversationDto extends createZodDto(conversationSchema) {}
