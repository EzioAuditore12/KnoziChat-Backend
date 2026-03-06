import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const conversationGroupSchema = z.object({
  id: z.any().transform((val) => String(val)),
  name: z.string().nonempty().max(50),
  avatar: z.string().nullable(),
  admins: z.array(z.uuid()),
  participants: z.array(z.uuid()).min(3),
  createdAt: z.any(),
  updatedAt: z.any(),
});

export const convertConversationGroupSchemaFromMongoose =
  conversationGroupSchema
    .omit({ id: true })
    .extend({ _id: z.any().transform((val) => String(val)) }) // Change this
    .transform(({ _id, ...rest }) => ({
      id: _id,
      ...rest,
    }));

export class ConversationGroupDto extends createZodDto(
  conversationGroupSchema,
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
