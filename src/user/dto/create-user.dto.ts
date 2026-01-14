import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

import { userInsertSchema } from '../entities/user.entity';

const createUserSchema = userInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export class CreateUserDto extends createZodDto(createUserSchema) {}
