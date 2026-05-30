import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const chatSchema = z.object({
  username: z.string(),
  message: z.string(),
  createdAt: z.any(),
});

export const groupSchema = z.object({
  groupId: z.string(),
  groupName: z.string(),
});

export const processQuerySchema = z.object({
  group: groupSchema,
  chats: z.array(chatSchema).optional(),
  query: z.string().nonempty(),
});

export class ChatDto extends createZodDto(chatSchema) {
  @ApiProperty({ type: 'string', example: '2022-01-01T00:00:00.000Z' })
  createdAt: Date;
}

export class GroupDto extends createZodDto(groupSchema) {}

export class ProcessQueryDto extends createZodDto(processQuerySchema) {}
