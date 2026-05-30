import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const authorizeDownloadRequestSchema = z.object({
  url: z.url(),
});

export class AuthorizeDownloadRequestDto extends createZodDto(
  authorizeDownloadRequestSchema,
) {}
