import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const authorizeUploadResponseSchema = z.object({
  allowed: z.boolean(),
  token: z.string(),
  userId: z.uuid(),
  projectId: z.string(),
  endpoint: z.string(),
  bucketId: z.string(),
});

export class AuthorizeUploadResponseDto extends createZodDto(
  authorizeUploadResponseSchema,
) {}
