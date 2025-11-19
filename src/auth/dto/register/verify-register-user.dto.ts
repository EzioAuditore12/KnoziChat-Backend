import { ApiProperty } from '@nestjs/swagger';

import { IsPhoneNumber, IsString, MaxLength } from 'class-validator';

export class VerifyRegisterUserDto {
  @ApiProperty({ example: '+91XXXXXXXXXX' })
  @IsPhoneNumber()
  @MaxLength(20)
  phoneNumber: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MaxLength(6)
  otp: string;
}
