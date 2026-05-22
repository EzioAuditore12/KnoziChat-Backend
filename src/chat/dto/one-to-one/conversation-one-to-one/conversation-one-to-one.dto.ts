import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const conversationOneToOneSchema = z.object({
  id: z.any().transform((val) => String(val)),
  participant1: z.uuid(),
  participant2: z.uuid(),
  lastSeenAt: z.preprocess(
    (value) => (value instanceof Map ? Object.fromEntries(value) : value),
    z.record(z.string(), z.any()).default({}),
  ),
  createdAt: z.any(),
  updatedAt: z.any(),
});

export const convertConversationOneToOneSchemaFromMongoose =
  conversationOneToOneSchema
    .omit({ id: true })
    .extend({ _id: z.any().transform((val) => String(val)) })
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

  @ApiProperty({ type: 'string', format: 'uuid' })
  participant1: string;

  @ApiProperty({ type: 'string', format: 'uuid' })
  participant2: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'string', format: 'date-time' },
    example: { 'user-uuid-1': '2025-09-14T12:34:56.789Z' },
  })
  lastSeenAt: Record<string, Date>;

  @ApiProperty({ example: '2025-09-14T12:34:56.789Z', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ example: '2025-09-14T12:34:56.789Z', format: 'date-time' })
  updatedAt: Date;
}
