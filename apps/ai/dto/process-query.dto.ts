import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const processQuerySchema = z.object({
  conversationId: z.string(),
  isGroup: z.preprocess((val) => {
    if (typeof val === 'string') return val === 'true';
    return Boolean(val);
  }, z.boolean()),
  query: z.string().nonempty(),
});

export class ProcessQueryDto extends createZodDto(processQuerySchema) {}
