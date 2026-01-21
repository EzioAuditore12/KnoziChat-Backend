import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';
import { objectIdSchema } from 'src/common/schemas/object-id.schema';

export const directChatSchema = z.object({
  _id: objectIdSchema,
  conversationId: objectIdSchema,
  senderId: z.string(),
  text: z.string().nonempty().max(1000),
  delivered: z.boolean(),
  seen: z.boolean(),
  createdAt: z.any(),
  updatedAt: z.any(),
  __v: z.number(),
});

export class DirectChatDto extends createZodDto(directChatSchema) {
  @ApiProperty({ example: '2025-09-14T12:34:56.789Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-09-14T12:34:56.789Z' })
  updatedAt: Date;
}
