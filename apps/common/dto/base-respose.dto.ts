import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const baseResponseSchema = z.object({
  status: z.enum(['success', 'faliure']),
  message: z.string(),
});

export class BaseResponseDto extends createZodDto(baseResponseSchema) {}
