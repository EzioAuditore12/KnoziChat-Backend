import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const multipleUuidSchema = z.object({
  participants: z.uuid().array(),
});

export class MultipleUuidDto extends createZodDto(multipleUuidSchema) {}
