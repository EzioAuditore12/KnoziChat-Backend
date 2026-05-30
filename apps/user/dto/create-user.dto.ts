import { createZodDto } from 'nestjs-zod';

import { userSchema } from './user.dto';

export const createUserSchema = userSchema.omit({
  id: true,
  username: true,
  createdAt: true,
  updatedAt: true,
});

export class CreateUserDto extends createZodDto(createUserSchema) {}
