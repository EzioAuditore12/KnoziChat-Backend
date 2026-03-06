import { z } from 'zod';
import { chatsOneToOneSchema } from '../chats-one-to-one/chats-one-to-one.dto';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

const startNewConversationResponseSchema = chatsOneToOneSchema.extend({
  receiverId: z.uuid(),
});

export class StartNewConversationResponseDto extends createZodDto(
  startNewConversationResponseSchema,
) {
  @ApiProperty({
    type: 'string',
    example: '12345678',
    description: 'snowflakeId',
  })
  id: string;

  @ApiProperty({
    type: 'string',
    example: '12345678',
    description: 'snowflakeId',
  })
  conversationId: string;

  @ApiProperty({ example: '2025-09-14T12:34:56.789Z', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ example: '2025-09-14T12:34:56.789Z', format: 'date-time' })
  updatedAt: Date;
}
