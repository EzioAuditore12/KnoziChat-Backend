import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const authorizeUploadRequestSchema = z.object({
  fileName: z.string(),
  mimeType: z.string(),
});

export class AuthorizeUploadRequestDto extends createZodDto(
  authorizeUploadRequestSchema,
) {}
