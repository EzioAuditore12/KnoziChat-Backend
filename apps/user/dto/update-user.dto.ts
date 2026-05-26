import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { userSchema } from './user.dto';

export const updateUserSchema = userSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    email: true,
    phoneNumber: true,
    password: true,
    expoPushToken: true,
  })
  .extend({ avatar: z.string().optional() })
  .partial();

export class UpdateUserDto extends createZodDto(updateUserSchema) {}
