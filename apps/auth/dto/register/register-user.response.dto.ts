import { baseResponseSchema } from 'apps/common/dto/base-respose.dto';
import { userSchema } from 'apps/user/dto/user.dto';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const registerUserResponseSchema = userSchema
  .pick({
    email: true,
  })
  .extend({
    duration: z.number(),
  })
  .extend(baseResponseSchema.shape);

export class RegisterUserResponseDto extends createZodDto(
  registerUserResponseSchema,
) {}
