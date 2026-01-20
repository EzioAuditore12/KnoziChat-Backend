import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

import { conversationsChangeSchema } from '../changes/conversations-change.dto';
import { directChatsChangeSchema } from '../changes/direct-chats-change.dto';
import { usersChangeSchema } from '../changes/users-change.dto';

const changesSchema = z.object({
  users: usersChangeSchema,
  conversations: conversationsChangeSchema,
  direct_chats: directChatsChangeSchema,
});

export const pullChangesResponseSchema = z.object({
  timestamp: z.number(),
  changes: changesSchema,
});

export class PullChangesResponseDto extends createZodDto(
  pullChangesResponseSchema,
) {}
