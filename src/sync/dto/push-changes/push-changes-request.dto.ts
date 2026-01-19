import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

import { conversationSyncSchema } from '../conversation-sync.dto';
import { directChatSyncSchema } from '../direct-chat-sync.dto';
import { tableNamesSyncSchema } from '../table-names-sync.dto';
import { userSyncSchema } from '../user-sync.dto';

const changeSchema = z.object({
  tableName: tableNamesSyncSchema,
  operation: z.enum(['CREATE', 'UPDATE', 'DELETE']),
  recordId: z.string(),
  data: z.union([conversationSyncSchema, directChatSyncSchema, userSyncSchema]),
});

export const pushChangesRequestSchema = z.object({
  changes: changeSchema.array(),
});

export class PushChangesRequestDto extends createZodDto(
  pushChangesRequestSchema,
) {}
