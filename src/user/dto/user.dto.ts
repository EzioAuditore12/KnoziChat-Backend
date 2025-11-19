import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class UserDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-XXX4-426614174000' })
  id: string;

  @ApiProperty({ maxLength: 50, example: 'John' })
  firstName: string;

  @ApiPropertyOptional({ maxLength: 50, example: 'Abhran', required: false })
  middleName?: string;

  @ApiProperty({ maxLength: 50, example: 'Doe' })
  lastName: string;

  @ApiProperty({ maxLength: 20, example: '+91234567890' })
  phoneNumber: string;

  @ApiPropertyOptional({
    type: 'string',
    maxLength: 254,
    example: 'example@gmail.com',
    required: false,
  })
  email?: string;

  @Exclude()
  @ApiProperty({ example: 'Example@123' })
  password: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg' })
  avatar?: string;

  @ApiProperty({ example: '2025-09-14T12:34:56.789Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-09-14T12:34:56.789Z' })
  updatedAt: Date;
}
