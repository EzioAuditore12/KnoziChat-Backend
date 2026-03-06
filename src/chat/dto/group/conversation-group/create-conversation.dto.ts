import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createConversationGroupSchema = z.object({
  name: z.string().nonempty().max(50),
  participants: z.array(z.uuid()),
});

export class CreateConversationGroupDto extends createZodDto(
  createConversationGroupSchema,
) {}
