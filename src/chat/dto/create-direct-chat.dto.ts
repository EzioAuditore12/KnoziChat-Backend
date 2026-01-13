import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, MaxLength } from 'class-validator';

export class CreateDirectChatDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-XXX4-426614174000' })
  @IsUUID()
  receiverId: string;

  @ApiProperty({ type: 'string', maxLength: 1000 })
  @MaxLength(1000)
  text: string;
}
