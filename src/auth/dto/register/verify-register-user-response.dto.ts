import { ApiProperty, OmitType } from '@nestjs/swagger';

import { BaseResponseDto } from 'src/common/dto/base-respose.dto';

import { UserDto } from 'src/user/dto/user.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

import { TokensDto } from '../tokens.dto';

export class VerifyRegisterUserResponseDto extends BaseResponseDto {
  @ApiProperty({ example: 'User Created Successfully' })
  declare message: string;

  @ApiProperty({ type: () => OmitType(UserDto, ['password']) })
  user: Omit<CreateUserDto, 'password'>;

  @ApiProperty({ type: () => TokensDto })
  tokens: TokensDto;
}
