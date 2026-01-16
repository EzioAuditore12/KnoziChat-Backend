import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createChatSchema = z.object({
  receiverId: z.uuid(),
  text: z.string().nonempty().max(1000),
});

export class CreateDirectChatDto extends createZodDto(createChatSchema) {}
