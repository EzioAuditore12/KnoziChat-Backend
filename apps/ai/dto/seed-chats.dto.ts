import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const seedChatsSchema = z.object({
  conversationId: z.string(),
  isGroup: z.boolean(),
  chats: z.array(
    z.object({
      username: z.string(),
      message: z.string(),
      createdAt: z.string(),
    }),
  ),
});

export class SeedChatsDto extends createZodDto(seedChatsSchema) {}
