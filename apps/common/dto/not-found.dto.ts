import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const notFoundSchema = z.object({
  message: z.string().default('Not Found Request'),
  error: z.string().default('Not Found'),
  statusCode: z.number().default(404),
});

export class NotFoundDto extends createZodDto(notFoundSchema) {}
