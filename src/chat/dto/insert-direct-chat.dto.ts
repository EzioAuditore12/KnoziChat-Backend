import { IsISO8601, IsString, MaxLength, MinLength } from 'class-validator';

import { IsObjectId } from 'src/common/validators/is-object-id';

export class InsertChatDto {
  @IsObjectId()
  _id: string;

  @IsObjectId()
  conversationId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  text: string;

  @IsISO8601()
  createdAt: string;
}
