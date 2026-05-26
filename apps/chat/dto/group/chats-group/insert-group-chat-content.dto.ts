import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

import { insertGroupChatSchema } from './insert-group-chat.dto';

export const insertGroupChatContentSchema = insertGroupChatSchema
  .omit({
    systemEventType: true,
    metadata: true,
    contentType: true,
  })
  .extend({
    contentType: z.enum(['image', 'video', 'text', 'file']),
  });

export class InsertGroupChatContentDto extends createZodDto(
  insertGroupChatContentSchema,
) {
  @ApiProperty({
    type: 'string',
    example: '12345678',
    description: 'snowflakeId',
    required: false,
  })
  id?: string;

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
