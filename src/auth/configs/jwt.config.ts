import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export default registerAs(
  'jwt',
  (): JwtModuleOptions => ({
    secret: process.env.JWT_SECRET!,
    signOptions: {
      expiresIn: Number(process.env.JWT_EXPIRE_IN!),
    },
  }),
);
