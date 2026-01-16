import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const conflictSchema = z.object({
  message: z.string().default('Conflict Request'),
  error: z.string().default('Conflict'),
  statusCode: z.number().default(409),
});

export class ConflictDto extends createZodDto(conflictSchema) {}
