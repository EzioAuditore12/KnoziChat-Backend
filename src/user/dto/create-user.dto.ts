import { createZodDto } from 'nestjs-zod';

import { userSchema } from './user.dto';

const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export class CreateUserDto extends createZodDto(createUserSchema) {}
