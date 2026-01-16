import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

import { userSchema } from 'src/user/dto/user.dto';

const loginUserSchema = userSchema
  .pick({
    phoneNumber: true,
    password: true,
    expoPushToken: true,
  })
  .extend({
    password: z.string().min(1).max(16),
  });

export class LoginUserDto extends createZodDto(loginUserSchema) {}
