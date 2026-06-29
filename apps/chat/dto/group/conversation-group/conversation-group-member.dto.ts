import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const conversationGroupMemberSchema = z.object({
  id: z.string(),
  groupId: z.any().transform((val) => String(val)),
  userId: z.uuid(),
  isAdmin: z.boolean(),
  createdAt: z.any(),
  updatedAt: z.any(),
  deletedAt: z.any().nullable(),
});

export const convertConversationGroupMemberSchemaFromMongoose =
  conversationGroupMemberSchema
    .omit({ id: true })
    .extend({ _id: z.any().transform((val) => String(val)) }) // Change this
    .transform(({ _id, ...rest }) => ({
      id: _id,
      ...rest,
    }));

export class ConversationGroupMemberDto extends createZodDto(
  conversationGroupMemberSchema,
) {
  @ApiProperty({
    type: 'string',
    example: '1234:dasjlklkaldsj',
    description: 'composite id',
  })
  id: string;

  @ApiProperty({ example: '2025-09-14T12:34:56.789Z', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ example: '2025-09-14T12:34:56.789Z', format: 'date-time' })
  updatedAt: Date;

  @ApiProperty({
    example: '2025-09-14T12:34:56.789Z',
    format: 'date-time',
    nullable: true,
  })
  deletedAt: Date | null;
}
