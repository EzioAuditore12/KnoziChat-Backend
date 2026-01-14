import { IsArray, IsEnum, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ConversationSyncDto } from '../conversation-sync.dto';
import { UserSyncDto } from '../user-sync.dto';
import { DirectChatSyncDto } from '../direct-chat-sync.dto';

// Define enums for validation
export enum TableNameType {
  CONVERSATIONS = 'conversations',
  DIRECT_CHATS = 'direct_chats',
  USERS = 'users',
}

export enum OperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

class ChangeDto {
  @IsEnum(TableNameType)
  tableName: TableNameType;

  @IsEnum(OperationType)
  operations: OperationType;

  @IsString()
  recordId: string;

  // TODO: Need to fix validations here
  @ValidateNested()
  @Type(() => Object)
  data: ConversationSyncDto | UserSyncDto | DirectChatSyncDto;
}

export class PushChangesRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChangeDto)
  changes: ChangeDto[];
}
