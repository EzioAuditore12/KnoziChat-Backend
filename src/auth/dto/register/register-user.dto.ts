import { z } from 'zod';
import { isStrongPassword } from 'validator';

import { CreateUserDto, createUserSchema } from 'src/user/dto/create-user.dto';
import { createZodDto } from 'nestjs-zod';

export const registerUserSchema = createUserSchema.extend({
  password: z
    .string()
    .max(16)
    .refine((val) => isStrongPassword(val), {
      error: 'Password not strong enough',
    }),
  avatar: z.string().optional(),
});

export class RegisterUserDto extends createZodDto(registerUserSchema) {}
