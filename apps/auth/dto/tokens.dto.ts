import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { jwt } from 'zod/v4';

export const tokensSchema = z.object({
  accessToken: z
    .string()
    .refine((val) => jwt(val), { error: 'Not a valid jwt token signature' }),
  refreshToken: z
    .string()
    .refine((val) => jwt(val), { error: 'Not a valid jwt token signature' }),
});

export class TokensDto extends createZodDto(tokensSchema) {}
