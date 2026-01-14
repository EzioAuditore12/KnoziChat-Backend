import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const itemResponseSchema = z.object({
  title: z.string().max(50),
  content: z.string().max(200),
  items: z.number().max(10),
});

export class ItemResponseDto extends createZodDto(itemResponseSchema) {}
