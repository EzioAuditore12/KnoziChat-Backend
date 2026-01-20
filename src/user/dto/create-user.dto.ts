import { createZodDto } from 'nestjs-zod';

import { userSchema } from './user.dto';
import { ApiProperty } from '@nestjs/swagger';

export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export class CreateUserDto extends createZodDto(createUserSchema) {
  @ApiProperty({ example: '2025-09-14T12:34:56.789Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-09-14T12:34:56.789Z' })
  updatedAt: Date;
}
