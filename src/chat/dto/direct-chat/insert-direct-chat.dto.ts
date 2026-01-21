import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

import { directChatSchema } from './direct-chat.dto';

export const insertDirectChatSchema = directChatSchema
  .omit({ _id: true, __v: true })
  .extend({
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
  });

export class InsertDirectChatDto extends createZodDto(insertDirectChatSchema) {
  @ApiProperty({ example: '2025-09-14T12:34:56.789Z' })
  createdAt?: Date;

  @ApiProperty({ example: '2025-09-14T12:34:56.789Z' })
  updatedAt?: Date;
}
