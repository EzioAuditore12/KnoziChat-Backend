import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

import { objectIdSchema } from 'src/common/schemas/object-id.schema';

export const conversationSchema = z.object({
  _id: objectIdSchema,
  participants: z.array(z.string()),
  lastMessage: z.string().optional(),
  createdAt: z.any(),
  updatedAt: z.any(),
  __v: z.number(),
});

export class ConversationDto extends createZodDto(conversationSchema) {
  @ApiProperty({ example: '2025-09-14T12:34:56.789Z', type: 'string' })
  createdAt: Date;

  @ApiProperty({ example: '2025-09-14T12:34:56.789Z', type: 'string' })
  updatedAt: Date;
}
