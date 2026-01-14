import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { UserSyncDto } from '../user-sync.dto';

export class UsersChangeDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserSyncDto)
  created: UserSyncDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserSyncDto)
  updated: UserSyncDto[];

  @IsArray()
  deleted: string[];
}
