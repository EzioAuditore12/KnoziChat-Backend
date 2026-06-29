import { baseResponseSchema } from 'apps/common/dto/base-respose.dto';
import { userSchema } from 'apps/user/dto/user.dto';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { tokensSchema } from './tokens.dto';

export const verifiedUserSchema = z
  .object({
    user: userSchema.omit({ password: true }),
    tokens: tokensSchema,
  })
  .extend(baseResponseSchema.shape);

export class VerifiedUserDto extends createZodDto(verifiedUserSchema) {}
