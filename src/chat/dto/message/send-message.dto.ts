import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

import { objectIdSchema } from 'src/common/schemas/object-id.schema';

export const sendMessageSchema = z.object({
  _id: z.string(),
  conversationId: z.string(),
  receiverId: z.string(),
  text: z.string().max(1000),
  createdAt: z.any(),
  updatedAt: z.any(),
});

export class SendMessageDto extends createZodDto(sendMessageSchema) {
  @ApiProperty({ example: '2025-09-14T12:34:56.789Z', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ example: '2025-09-14T12:34:56.789Z', format: 'date-time' })
  updatedAt: Date;
}
