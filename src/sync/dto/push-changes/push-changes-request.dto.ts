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
    tableName: z.enum(['conversations']),
    data: conversationSyncSchema,
  })
  .extend(changeSchema.shape);

export const directChatPushRequestChangeSchema = z
  .object({
    tableName: z.enum(['direct_chats']),
    data: directChatSyncSchema,
  })
  .extend(changeSchema.shape);

export const universalChangeSchema = z.union([
  conversationPushRequestChangeSchema,
  directChatPushRequestChangeSchema,
]);

export const pushChangesRequestSchema = z.object({
  changes: universalChangeSchema.array(),
});

export class ConversationPushRequestChangeDto extends createZodDto(
  conversationPushRequestChangeSchema,
) {}

export class DirectChatPushRequestChangeDto extends createZodDto(
  directChatPushRequestChangeSchema,
) {}

export class PushChangesRequestDto extends createZodDto(
  pushChangesRequestSchema,
) {}
