import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const authorizeUploadResponseSchema = z.object({
  allowed: z.boolean(),
  url: z.url(),
  projectId: z.string(),
  bucketId: z.string(),
  endpoint: z.string(),
  authorizationToken: z.jwt(),
  requiredHeaders: z.object({
    'x-appwrite-project': z.literal('x-appwrite-project'),
    'x-appwrite-jwt': z.literal('x-appwrite-jwt'),
    'content-range': z.literal('content-range'),
    'x-appwrite-id': z.literal('x-appwrite-id'),
  }),
});

export class AuthorizeUploadResponseDto extends createZodDto(
  authorizeUploadResponseSchema,
) {}
