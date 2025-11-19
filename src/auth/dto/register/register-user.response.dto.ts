import { ApiProperty } from '@nestjs/swagger';

import { BaseResponseDto } from 'src/common/dto/base-respose.dto';

export class RegisterUserResponseDto extends BaseResponseDto {
  @ApiProperty({ example: 'Verification Otp Send Successfully' })
  declare message: string;

  @ApiProperty({ example: '+91XXXXXXXXXX' })
  phoneNumber: string;
}
