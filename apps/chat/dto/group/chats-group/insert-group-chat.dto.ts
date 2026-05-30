import { createZodDto } from 'nestjs-zod';
import { chatsGroupSchema } from './chats-group.dto';
import { ApiProperty } from '@nestjs/swagger';

export const insertGroupChatSchema = chatsGroupSchema.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
  metadata: true,
  attachmentUrl: true,
  content: true,
  systemEventType: true,
});

export class InsertGroupChatDto extends createZodDto(insertGroupChatSchema) {
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
