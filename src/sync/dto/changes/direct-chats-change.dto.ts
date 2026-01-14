import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { DirectChatSyncDto } from '../direct-chat-sync.dto';

export class DirectChatsChangeDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DirectChatSyncDto)
  created: DirectChatSyncDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DirectChatSyncDto)
  updated: DirectChatSyncDto[];

  @IsArray()
  deleted: string[];
}
