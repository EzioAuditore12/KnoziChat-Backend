import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const unauthorizedSchema = z.object({
  message: z.string().default('Unauthorized Request'),
  error: z.string().default('Unauthorized'),
  statusCode: z.number().default(401),
});

export class UnauthorizedDto extends createZodDto(unauthorizedSchema) {}
