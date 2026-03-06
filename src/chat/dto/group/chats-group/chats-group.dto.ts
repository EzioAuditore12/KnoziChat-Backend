import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const chatsGroupSchema = z.object({
  id: z.any().transform((val) => String(val)),
  conversationId: z.any().transform((val) => String(val)),
  senderId: z.uuid(),
  text: z.string().max(1000),
  deliveredTo: z.array(z.uuid()),
  seenBy: z.array(z.uuid()),
  createdAt: z.any(),
  updatedAt: z.any(),
});

export const convertChatsGroupFromMongoose = chatsGroupSchema
  .omit({ id: true })
  .extend({ _id: z.any().transform((val) => String(val)) })
  .transform(({ _id, ...rest }) => ({
    id: _id,
    ...rest,
  }));

export class ChatsGroupDto extends createZodDto(chatsGroupSchema) {
  @ApiProperty({
    type: 'string',
    example: '12345678',
    description: 'snowflakeId',
  })
  id: string;

  @ApiProperty({
    type: 'string',
    example: '12345678',
    description: 'snowflakeId',
  })
  conversationId: string;

  @ApiProperty({ example: '2025-09-14T12:34:56.789Z', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ example: '2025-09-14T12:34:56.789Z', format: 'date-time' })
  updatedAt: Date;
}
