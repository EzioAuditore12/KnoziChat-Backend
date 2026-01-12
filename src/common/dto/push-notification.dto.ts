import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, IsOptional, IsObject } from 'class-validator';

export class PushNotificationDto {
  @ApiProperty()
  @IsString()
  expoPushToken: string;

  @ApiProperty({ maxLength: 50 })
  @IsString()
  @MaxLength(50)
  title: string;

  @ApiProperty({ maxLength: 100 })
  @IsString()
  @MaxLength(100)
  body: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
