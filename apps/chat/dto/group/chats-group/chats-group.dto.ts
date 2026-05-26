import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

export const chatsGroupSchema = z
  .object({
    id: z.any().transform((val) => String(val)),
    conversationId: z.any().transform((val) => String(val)),
    senderId: z.uuid(),
    contentType: z.enum(['image', 'video', 'text', 'file', 'system']),
    content: z.string().nullable(),
    systemEventType: z
      .enum([
        'member_left',
        'member_joined',
        'admin_changed',
        'group_name_changed',
        'group_avatar_changed',
        'group_created',
      ])
      .nullable(),
    status: z.enum(['DELIVERED', 'SEEN']).default('DELIVERED'),
    metadata: z.record(z.string(), z.any()).nullable(),
    attachmentUrl: z.url().nullable(),
    deletedBy: z.uuid().nullable().optional(),
    createdAt: z.any(),
    updatedAt: z.any(),
    deletedAt: z.any().nullable().optional(),
  })
  .partial({ status: true });

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

  @ApiProperty({
    example: '2025-09-14T12:34:56.789Z',
    format: 'date-time',
    nullable: true,
  })
  deletedAt?: Date | null;
}
