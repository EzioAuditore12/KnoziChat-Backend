import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const processQuerySchema = z.object({
  conversationId: z.string(),
  isGroup: z.coerce.boolean(),
  query: z.string().nonempty(),
});

export class ProcessQueryDto extends createZodDto(processQuerySchema) {}
