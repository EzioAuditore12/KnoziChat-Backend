import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

import { tableNamesSyncSchema } from '../table-names-sync.dto';

export const pullChangesRequestSchema = z.object({
  lastSyncAt: z.number().optional().default(0),
  tables: tableNamesSyncSchema.array(),
});

export class PullChangesRequestDto extends createZodDto(
  pullChangesRequestSchema,
) {}
