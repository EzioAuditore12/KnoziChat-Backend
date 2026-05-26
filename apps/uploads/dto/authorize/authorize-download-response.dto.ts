import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const authorizeDownloadResponseSchema = z.object({
  allowed: z.boolean(),
  downloadUrl: z.url(),
  fileType: z.enum(['file', 'image', 'video']),
  size: z.number(),
});

export class AuthorizeDownloadResponseDto extends createZodDto(
  authorizeDownloadResponseSchema,
) {}
