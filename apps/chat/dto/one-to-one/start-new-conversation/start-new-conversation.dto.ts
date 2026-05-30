import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

import { chatsOneToOneSchema } from '../chats-one-to-one/chats-one-to-one.dto';

export const startNewConversationSchema = chatsOneToOneSchema
  .omit({
    senderId: true,
    status: true,
    deletedAt: true,
    conversationId: true,
  })
  .partial({ id: true, createdAt: true, updatedAt: true, attachmentUrl: true })
  .extend({
    attachmentUrl: z.url().nullable().optional().default(null),
  });

export class StartNewConversationDto extends createZodDto(
  startNewConversationSchema,
) {
  @ApiProperty({
    example: '2025-09-14T12:34:56.789Z',
    format: 'date-time',
    required: false,
  })
  createdAt?: Date;

  @ApiProperty({
    example: '2025-09-14T12:34:56.789Z',
    format: 'date-time',
    required: false,
  })
  updatedAt?: Date;
}
