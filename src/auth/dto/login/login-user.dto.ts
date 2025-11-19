import { IsPhoneNumber, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ maxLength: 20, example: '+917823132423' })
  @IsPhoneNumber()
  @MaxLength(20)
  phoneNumber: string;

  @ApiProperty({ maxLength: 16, example: 'Example@123' })
  @IsString()
  password: string;
}
