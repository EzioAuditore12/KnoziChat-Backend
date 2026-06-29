import { publicUserSchema } from 'apps/user/dto/public-user.dto';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const userSyncSchema = publicUserSchema.extend({
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const userSyncChangeSchema = z.object({
  created: z.array(userSyncSchema),
  updated: z.array(userSyncSchema),
  deleted: z.array(z.uuid()),
});

export class UserSyncDto extends createZodDto(userSyncSchema) {}

export class UserSyncChangeDto extends createZodDto(userSyncChangeSchema) {}
