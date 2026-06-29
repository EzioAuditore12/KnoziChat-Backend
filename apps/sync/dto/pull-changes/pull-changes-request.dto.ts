import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { tableNamesSchema } from '../table-names-sync.dto';

export const pullChangesRequestSchema = z.object({
  lastSyncedAt: z.number().default(0),
  tableNames: tableNamesSchema,
});

export class PullChangesRequestDto extends createZodDto(
  pullChangesRequestSchema,
) {}
