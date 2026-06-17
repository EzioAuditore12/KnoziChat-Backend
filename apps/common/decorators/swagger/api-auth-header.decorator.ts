import { applyDecorators } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';

export function ApiAuthHeader() {
  return applyDecorators(
    ApiHeader({
      name: 'Authorization',
      description: 'Bearer JWT token',
      required: true,
      example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    }),
  );
}
