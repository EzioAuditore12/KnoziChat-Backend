import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const userSyncSchema = z.object({
  id: z.string(),
  first_name: z.string().min(1).max(50),
  middle_name: z.string().min(1).max(50).nullable(),
  last_name: z.string().min(1).max(50),
  phone_number: z.string(),
  email: z.email().nullable(),
  avatar: z.url().nullable(),
  created_at: z.number(),
  updated_at: z.number(),
});

export class UserSyncDto extends createZodDto(userSyncSchema) {}
