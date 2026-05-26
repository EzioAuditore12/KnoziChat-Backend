import { createZodDto } from 'nestjs-zod';
import { userSchema } from './user.dto';
import { ApiProperty } from '@nestjs/swagger';

export const publicUserSchema = userSchema.omit({
  password: true,
  expoPushToken: true,
});

export class PublicUserDto extends createZodDto(publicUserSchema) {
  @ApiProperty({
    example: '2025-09-14T12:34:56.789Z',
    format: 'date-time',
    type: 'string',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-09-14T12:34:56.789Z',
    format: 'date-time',
    type: 'string',
  })
  updatedAt: Date;
}
