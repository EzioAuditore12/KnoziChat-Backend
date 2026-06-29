import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';

import { conversationGroupMemberSchema } from './conversation-group-member.dto';

export const insertConversationGroupMemberSchema = conversationGroupMemberSchema
  .partial({ createdAt: true, updatedAt: true })
  .omit({ deletedAt: true });

export const insertConversationGroupMemberSchemaForMonoose =
  conversationGroupMemberSchema
    .partial({ createdAt: true, updatedAt: true })
    .omit({
      deletedAt: true,
    })
    .transform(({ id, createdAt, groupId, ...rest }) => ({
      _id: id,
      groupId: BigInt(groupId),
      createdAt: (createdAt as Date) ?? (new Date() as Date),
      ...rest,
      deletedAt: null,
    }));

export class InsertConversationGroupMemberDto extends createZodDto(
  insertConversationGroupMemberSchema,
) {
  @ApiProperty({
    type: 'string',
    example: '1234:dasjlklkaldsj',
    description: 'composite id',
  })
  id: string;

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
