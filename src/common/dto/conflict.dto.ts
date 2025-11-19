import { ApiProperty } from '@nestjs/swagger';

export class ConflictDto {
  @ApiProperty({ example: 'Conflict Request' })
  message: string = 'Conflict Request';

  @ApiProperty({ example: 'Conflict' })
  error: string = 'Conflict';

  @ApiProperty({ type: 'number', example: 409 })
  statusCode: number = 409;
}
