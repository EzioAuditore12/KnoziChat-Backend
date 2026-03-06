import { createZodDto } from 'nestjs-zod';
import { chatsOneToOneSchema } from './chats-one-to-one.dto';
import { ApiProperty } from '@nestjs/swagger';

export const insertOneToOneChatSchema = chatsOneToOneSchema.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export class InsertOneToOneChatDto extends createZodDto(
  insertOneToOneChatSchema,
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
