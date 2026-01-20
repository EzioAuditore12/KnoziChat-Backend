import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const changeResponseSchema = z.object({
  recordId: z.string(),
  serverId: z.string(),
  serverUpdatedAt: z.number(),
  error: z.string().optional(),
});

export const pushChangeResponseSchema = z.object({
  success: z.boolean(),
  results: changeResponseSchema.array(),
});

export class ChangeResponseDto extends createZodDto(changeResponseSchema) {}

export class PushChangesResponseDto extends createZodDto(
  pushChangeResponseSchema,
) {}
