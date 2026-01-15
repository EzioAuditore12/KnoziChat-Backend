import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

import { userSchema } from 'src/user/dto/user.dto';
import { tokensSchema } from './tokens.dto';
import { baseResponseSchema } from 'src/common/dto/base-respose.dto';

export const verifiedUserSchema = z
  .object({
    user: userSchema.omit({ password: true }),
    tokens: tokensSchema,
  })
  .and(baseResponseSchema);

export class VerifiedUserDto extends createZodDto(verifiedUserSchema) {}
