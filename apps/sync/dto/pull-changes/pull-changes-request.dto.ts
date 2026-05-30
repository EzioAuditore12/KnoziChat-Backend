import { z } from 'zod';
import { tableNamesSchema } from '../table-names-sync.dto';
import { createZodDto } from 'nestjs-zod';

export const pullChangesRequestSchema = z.object({
  lastSyncedAt: z.number().default(0),
  tableNames: tableNamesSchema,
});

export class PullChangesRequestDto extends createZodDto(
  pullChangesRequestSchema,
) {}
