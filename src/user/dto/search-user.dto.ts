import { IsOptional, IsString, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class SearchUserDto extends PaginationDto {
  @ApiPropertyOptional({ maxLength: 50, example: 'John' })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  firstName?: string;
}
