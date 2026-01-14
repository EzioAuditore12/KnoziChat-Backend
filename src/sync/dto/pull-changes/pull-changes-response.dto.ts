import { IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { UsersChangeDto } from '../changes/users-change.dto';
import { ConversationsChangeDto } from '../changes/conversations-change.dto';
import { DirectChatsChangeDto } from '../changes/direct-chats-change.dto';

class ChangesDto {
  @ValidateNested()
  @Type(() => UsersChangeDto)
  users: UsersChangeDto;

  @ValidateNested()
  @Type(() => ConversationsChangeDto)
  conversations: ConversationsChangeDto;

  @ValidateNested()
  @Type(() => DirectChatsChangeDto)
  direct_chats: DirectChatsChangeDto;
}

export class PullChangesResponseDto {
  @IsNumber()
  timestamp: number;

  @ValidateNested()
  @Type(() => ChangesDto)
  changes: ChangesDto;
}
