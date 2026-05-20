import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const authorizeDownloadRequestSchema = z.object({
  allowed: z.boolean(),
  downloadUrl: z.url(),
  fileType: z.enum(['file', 'image', 'video']),
});

export class AuthorizeDownloadRequestDto extends createZodDto(
  authorizeDownloadRequestSchema,
) {}
