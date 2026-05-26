import { createZodDto } from 'nestjs-zod';

import { userSchema } from './user.dto';
import { ApiProperty } from '@nestjs/swagger';

export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export class CreateUserDto extends createZodDto(createUserSchema) {}
