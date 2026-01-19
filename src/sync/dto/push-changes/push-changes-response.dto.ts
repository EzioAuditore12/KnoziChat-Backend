import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const changeResponseSchema = z.object({
  recordId: z.string(),
  serverId: z.string(),
  serverUpdatedAt: z.number(),
  error: z.string().optional(),
});

export const pushChangeResponseSchema = z.object({
  success: z.boolean(),
  results: changeResponseSchema.array(),
});

export class PushChangesResponseDto extends createZodDto(
  pushChangeResponseSchema,
) {}
