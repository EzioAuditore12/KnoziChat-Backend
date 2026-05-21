import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

import { conversationGroupSchema } from '../conversation-group.dto';
import { chatsGroupSchema } from '../../chats-group/chats-group.dto';

export const createConversationGroupResponseSchema =
  conversationGroupSchema.extend({
    participantIds: z.array(z.uuid()),
    adminIds: z.array(z.uuid()),
    chat: chatsGroupSchema,
  });

export class CreateConversationGroupResponseDto extends createZodDto(
  createConversationGroupResponseSchema,
) {}
