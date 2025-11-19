import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';

export class CreateDirectChatDto {
  @ApiProperty({ type: 'string', maxLength: 1000 })
  @MaxLength(1000)
  text: string;
}
