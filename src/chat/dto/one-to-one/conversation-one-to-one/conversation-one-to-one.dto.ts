import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const conversationOneToOneSchema = z.object({
  id: z.any().transform((val) => String(val)), // Change this
  participants: z.array(z.uuid()).length(2),
  createdAt: z.any(),
  updatedAt: z.any(),
});

export const convertConversationOneToOneSchemaFromMongoose =
  conversationOneToOneSchema
    .omit({ id: true })
    .extend({ _id: z.any().transform((val) => String(val)) }) // Change this
    .transform(({ _id, ...rest }) => ({
      id: _id,
      ...rest,
    }));

export class ConversationOneToOneDto extends createZodDto(
  conversationOneToOneSchema,
) {
  @ApiProperty({
    type: 'string',
    example: '12345678',
    description: 'snowflakeId',
  })
  id: string;

  @ApiProperty({ example: '2025-09-14T12:34:56.789Z', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ example: '2025-09-14T12:34:56.789Z', format: 'date-time' })
  updatedAt: Date;
}
