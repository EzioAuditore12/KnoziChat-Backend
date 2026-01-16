import { z } from 'zod';
import { isStrongPassword } from 'validator';

import { CreateUserDto, createUserSchema } from 'src/user/dto/create-user.dto';

export const registerUserSchema = createUserSchema.extend({
  password: z
    .string()
    .max(16)
    .refine((val) => isStrongPassword(val), {
      error: 'Password not strong enough',
    }),
});

export class RegisterUserDto extends CreateUserDto {}
