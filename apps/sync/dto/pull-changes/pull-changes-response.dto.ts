import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { chatsAttachmentSyncChangeSchema } from '../chat-attachment-sync.dto';
import { chatsGroupSyncChangeSchema } from '../chats-group-sync.dto';
import { chatsOneToOneSyncChangeSchema } from '../chats-one-to-one-sync.dto';
import { conversationGroupMemberSyncChangeSchema } from '../conversation-group-member-sync.dto';
import { conversationGroupSyncChangeSchema } from '../conversation-group-sync.shema';
import { conversationOneToOneSyncChangeSchema } from '../conversation-one-to-one-sync.dto';
import { userSyncChangeSchema } from '../user-sync.dto';

export const pullChangesResponseSchema = z.object({
  timestamp: z.number(),
  changes: z.object({
    user: userSyncChangeSchema,
    conversationDirect: conversationOneToOneSyncChangeSchema,
    conversationGroup: conversationGroupSyncChangeSchema,
    chatsDirect: chatsOneToOneSyncChangeSchema,
    chatsGroup: chatsGroupSyncChangeSchema,
    conversationGroupMembers: conversationGroupMemberSyncChangeSchema,
    chatsAttachments: chatsAttachmentSyncChangeSchema,
  }),
});

export class PullChangesResponseDto extends createZodDto(
  pullChangesResponseSchema,
) {}
