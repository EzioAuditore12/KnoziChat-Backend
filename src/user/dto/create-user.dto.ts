import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ maxLength: 50, example: 'John' })
  @IsString()
  @Length(1, 50)
  firstName: string;

  @ApiPropertyOptional({ maxLength: 50, example: 'Abhran', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  middleName?: string;

  @ApiProperty({ maxLength: 50, example: 'Doe' })
  @IsString()
  @Length(1, 50)
  lastName: string;

  @ApiProperty({ maxLength: 20, example: '+91234567890' })
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiPropertyOptional({
    type: 'string',
    maxLength: 254,
    example: 'example@gmail.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ maxLength: 16, example: 'example@123' })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  @MaxLength(16)
  password: string;

  @ApiProperty({
    example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
    nullable: true,
    required: false,
  })
  @IsOptional()
  expoPushToken?: string;
}
