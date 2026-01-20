import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

import { conversationSyncSchema } from '../conversation-sync.dto';
import { directChatSyncSchema } from '../direct-chat-sync.dto';
import { tableNamesSyncSchema } from '../table-names-sync.dto';
import { userSyncSchema } from '../user-sync.dto';

const changeSchema = z.object({
  operation: z.enum(['CREATE', 'UPDATE', 'DELETE']),
  recordId: z.string(),
});

export const conversationPushRequestChangeSchema = z
  .object({
    data: conversationSyncSchema,
  })
  .extend(changeSchema.shape);

export const directChatPushRequestChangeSchema = z
  .object({
    data: directChatSyncSchema,
  })
  .extend(changeSchema.shape);

export const universalChangeSchema = z
  .object({
    data: z.union([
      conversationSyncSchema,
      directChatSyncSchema,
      userSyncSchema,
    ]),
  })
  .extend(changeSchema.shape);

export const changeRequestSchema = z
  .object({
    tableName: tableNamesSyncSchema,
  })
  .extend(universalChangeSchema.shape);

export const pushChangesRequestSchema = z.object({
  changes: changeRequestSchema.array(),
});

export class ConversationPushRequestChangeDto extends createZodDto(
  conversationPushRequestChangeSchema,
) {}

export class DirectChatPushRequestChangeDto extends createZodDto(
  directChatPushRequestChangeSchema,
) {}

export class ChangeRequestSchemaDto extends createZodDto(changeRequestSchema) {}

export class PushChangesRequestDto extends createZodDto(
  pushChangesRequestSchema,
) {}
