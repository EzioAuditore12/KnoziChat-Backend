import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const startNewConversationSchema = z.object({
  receiverId: z.uuid(),
  text: z.string().max(1000),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
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
