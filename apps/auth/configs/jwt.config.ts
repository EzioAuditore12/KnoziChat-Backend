import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { env } from 'apps/env';

export default registerAs(
  'jwt',
  (): JwtModuleOptions => ({
    secret: env.JWT_SECRET,
    signOptions: {
      expiresIn: env.JWT_EXPIRE_IN,
    },
  }),
);
