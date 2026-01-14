import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ConversationSyncDto } from '../conversation-sync.dto';

export class ConversationsChangeDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConversationSyncDto)
  created: ConversationSyncDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConversationSyncDto)
  updated: ConversationSyncDto[];

  @IsArray()
  deleted: string[];
}
