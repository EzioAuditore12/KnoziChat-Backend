import { ApiProperty } from '@nestjs/swagger';

export class NotFoundDto {
  @ApiProperty({ example: 'Not Found Request' })
  message: string = 'Not Found Request';

  @ApiProperty({ example: 'Not Found' })
  error: string = 'Not Found';

  @ApiProperty({ type: 'number', example: 404 })
  statusCode: number = 404;
}
