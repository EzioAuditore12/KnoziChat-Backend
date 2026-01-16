import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const userSchema = z.object({
  id: z.uuid(),
  firstName: z.string().nonempty().max(50),
  middleName: z.string().nullable().optional(),
  lastName: z.string().nonempty().max(50),
  avatar: z.url().nullable().optional(),
  password: z.string().max(16),
  phoneNumber: z.string().max(20),
  email: z.email().max(240).nullable().optional(),
  expoPushToken: z.string().nullable().optional(),
  createdAt: z.any(), // TODO: workaround for now will fix later
  updatedAt: z.any(), // TODO: workaround for now will fix later
});

export class UserDto extends createZodDto(userSchema) {}
