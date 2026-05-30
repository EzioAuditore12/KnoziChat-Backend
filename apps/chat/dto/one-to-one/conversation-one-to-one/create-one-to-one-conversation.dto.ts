import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const createConversationOneToOneSchema = z.object({
  participant1: z.uuid(),
  participant2: z.uuid(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

export class CreateConversationOneToOneDto extends createZodDto(
  createConversationOneToOneSchema,
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
