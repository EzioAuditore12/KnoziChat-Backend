import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const multipleUuidSchema = z.object({
  participants: z.uuid().array(),
});

export class MultipleUuidDto extends createZodDto(multipleUuidSchema) {}
