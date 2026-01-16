import { z } from 'zod';

import { userSyncSchema } from '../user-sync.dto';
import { createZodDto } from 'nestjs-zod';

export const usersChangeSchema = z.object({
  created: z.array(userSyncSchema),
  updated: z.array(userSyncSchema),
  deleted: z.array(z.string()),
});

export class UsersChangeDto extends createZodDto(usersChangeSchema) {}
