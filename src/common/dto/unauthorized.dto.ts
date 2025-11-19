import { ApiProperty } from '@nestjs/swagger';

export class UnauthorizedDto {
  @ApiProperty({ example: 'Unauthorized Request' })
  message: string = 'Unauthorized Request';

  @ApiProperty({ example: 'Unauthorized' })
  error: string = 'Unauthorized';

  @ApiProperty({ type: 'number', example: 401 })
  statusCode: number = 401;
}
