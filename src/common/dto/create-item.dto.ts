import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const createItemSchema = z.object({
  title: z.string().nonempty().max(50).describe('This is title'),
  content: z.string().nonempty().max(200),
  items: z.number().max(10),
});

export class CreateItemDto extends createZodDto(createItemSchema) {}
