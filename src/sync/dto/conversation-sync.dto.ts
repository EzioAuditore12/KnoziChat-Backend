import { IsNumber, IsString, IsUUID } from 'class-validator';

export class ConversationSyncDto {
  @IsString()
  id: string;

  @IsUUID()
  user_id: string;

  @IsNumber()
  created_at: number;

  @IsNumber()
  updated_at: number;
}
