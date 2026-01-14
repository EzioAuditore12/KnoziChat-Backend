import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UserSyncDto {
  @IsString()
  id: string;

  @IsString()
  @MaxLength(50)
  first_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  middle_name: string;

  @IsString()
  @MaxLength(50)
  last_name: string;

  @IsPhoneNumber()
  phone_number: string;

  @IsOptional()
  @IsEmail()
  email: string | null;

  @IsOptional()
  @IsUrl()
  avatar: string | null;

  @IsNumber()
  created_at: number;

  @IsNumber()
  updated_at: number;
}
