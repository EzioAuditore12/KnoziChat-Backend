import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

import { userSyncChangeSchema } from '../user-sync.dto';
import { conversationOneToOneSyncChangeSchema } from '../conversation-one-to-one-sync.dto';
import { chatsOneToOneSyncChangeSchema } from '../chats-one-to-one-sync.dto';
import { conversationGroupSyncChangeSchema } from '../conversation-group-sync.shema';
import { chatsGroupSyncChangeSchema } from '../chats-group-sync.dto';

export const pullChangesResponseSchema = z.object({
  timestamp: z.number(),
  changes: z.object({
    user: userSyncChangeSchema,
    conversationOneToOne: conversationOneToOneSyncChangeSchema,
    conversationGroup: conversationGroupSyncChangeSchema,
    chatsOneToOne: chatsOneToOneSyncChangeSchema,
    chatsGroup: chatsGroupSyncChangeSchema,
  }),
});

export class PullChangesResponseDto extends createZodDto(
  pullChangesResponseSchema,
) {}
