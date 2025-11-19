import { ApiProperty } from '@nestjs/swagger';

import { ResponseStatus } from '../enums/response-status.enum';

export class BaseResponseDto {
  @ApiProperty({ enum: ResponseStatus, example: ResponseStatus.SUCCESS })
  status: ResponseStatus;

  @ApiProperty({ example: 'Operation completed successfully.' })
  message: string;
}
