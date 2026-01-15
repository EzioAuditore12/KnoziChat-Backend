import { createZodDto } from 'nestjs-zod';

import { tokensSchema } from './tokens.dto';

export const refreshTokensSchema = tokensSchema.pick({ refreshToken: true });

export class RefreshTokensDto extends createZodDto(refreshTokensSchema) {}
