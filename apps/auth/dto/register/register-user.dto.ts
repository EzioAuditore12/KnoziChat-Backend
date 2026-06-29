import { CreateUserDto, createUserSchema } from 'apps/user/dto/create-user.dto';
import { createZodDto } from 'nestjs-zod';
import { isStrongPassword } from 'validator';
import { z } from 'zod';

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
