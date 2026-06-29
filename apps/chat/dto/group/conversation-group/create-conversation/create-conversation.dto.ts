import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createConversationGroupSchema = z.object({
  name: z.string().nonempty().max(50),
  avatar: z.string().optional(),
  participants: z.preprocess((val) => {
    if (Array.isArray(val)) return val;

    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);

        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [val];
      }

      return [val];
    }

    return [];
  }, z.array(z.uuid())),
});

export class CreateConversationGroupDto extends createZodDto(
  createConversationGroupSchema,
) {}
