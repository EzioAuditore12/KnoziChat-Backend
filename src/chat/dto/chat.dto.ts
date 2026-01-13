import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

@Expose()
export class ChatDto {
  @Expose()
  @ApiProperty({
    example: '64b7f8c2e4b0f5a1d2c3e4f5',
    description: 'MongoDB ObjectId',
  })
  _id: string;

  @Expose()
  @ApiProperty({ example: '123e4567-e89b-12d3-XXX4-426614174000' })
  senderId: string;

  @Expose()
  @ApiProperty({ example: '123e4567-e89b-12d3-XXX4-426614174000' })
  receiverId: string;

  @Expose()
  @ApiProperty({ example: 'This is sample text' })
  text: string;

  @Expose()
  @ApiProperty({ type: Boolean, default: false })
  delivered: false;

  @Expose()
  @ApiProperty({ type: Boolean, default: false })
  seen: boolean;

  @Expose()
  @ApiProperty({ example: '2025-09-14T12:34:56.789Z' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2025-09-14T12:34:56.789Z' })
  updatedAt: Date;
}
