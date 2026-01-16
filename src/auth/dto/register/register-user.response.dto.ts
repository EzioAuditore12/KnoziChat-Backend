import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { baseResponseSchema } from 'src/common/dto/base-respose.dto';
import { userSchema } from 'src/user/dto/user.dto';

export const registerUserResponseSchema = userSchema
  .pick({
    phoneNumber: true,
  })
  .extend({
    duration: z.number(),
  })
  .extend(baseResponseSchema.shape);

export class RegisterUserResponseDto extends createZodDto(
  registerUserResponseSchema,
) {}
