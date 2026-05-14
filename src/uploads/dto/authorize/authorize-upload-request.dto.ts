import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const authorizeUploadRequestSchema = z.object({
  fileName: z.string(),
  mimeType: z.string(),
});

export class AuthorizeUploadRequestDto extends createZodDto(
  authorizeUploadRequestSchema,
) {}
