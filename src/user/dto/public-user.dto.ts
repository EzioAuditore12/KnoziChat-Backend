import { createZodDto } from 'nestjs-zod';
import { userSchema } from './user.dto';

export const publicUserSchema = userSchema.omit({
  password: true,
  expoPushToken: true,
});

export class PublicUserDto extends createZodDto(publicUserSchema) {}
