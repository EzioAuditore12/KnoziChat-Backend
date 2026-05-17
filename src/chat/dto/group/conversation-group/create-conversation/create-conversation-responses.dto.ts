import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

import { conversationGroupSchema } from '../conversation-group.dto';

export const createConversationGroupResponseSchema =
  conversationGroupSchema.extend({
    participantIds: z.array(z.uuid()),
    adminIds: z.array(z.uuid()),
  });

export class CreateConversationGroupResponseDto extends createZodDto(
  createConversationGroupResponseSchema,
) {}
