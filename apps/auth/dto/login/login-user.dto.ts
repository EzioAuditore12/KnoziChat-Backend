import { userSchema } from 'apps/user/dto/user.dto';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const loginUserSchema = userSchema
  .pick({
    email: true,
    password: true,
    expoPushToken: true,
  })
  .extend({
    password: z.string().min(1).max(16),
  });

export class LoginUserDto extends createZodDto(loginUserSchema) {}
