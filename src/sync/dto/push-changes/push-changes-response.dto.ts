import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class ChangeResponseDto {
  @IsString()
  recordId: string;

  @IsString()
  serverId: string;

  @IsNumber()
  serverUpdatedAt: number;

  @IsString()
  @IsOptional()
  error?: string;
}

export class PushChangeResponseDto {
  @IsBoolean()
  success: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChangeResponseDto)
  results: ChangeResponseDto[];
}
