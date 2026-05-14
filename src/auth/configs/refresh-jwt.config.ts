import { registerAs } from '@nestjs/config';
import { JwtSignOptions } from '@nestjs/jwt';

import { env } from 'src/env';

export default registerAs(
  'refresh-jwt',
  (): JwtSignOptions => ({
    secret: env.REFRESH_JWT_SECRET,
    expiresIn: env.REFRESH_JWT_EXPIRE_IN,
  }),
);
