import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class DirectChatSyncDto {
  @IsString()
  id: string;

  @IsString()
  conversation_id: string;

  @IsString()
  @MaxLength(1000)
  text: string;

  @IsEnum(['SENT', 'RECEIVED'])
  mode: 'SENT' | 'RECEIVED';

  @IsBoolean()
  is_delivered: boolean;

  @IsBoolean()
  is_seen: boolean;

  @IsNumber()
  created_at: number;

  @IsNumber()
  updated_at: number;
}
