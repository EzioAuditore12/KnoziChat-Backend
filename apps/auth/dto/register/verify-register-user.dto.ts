import { userSchema } from 'apps/user/dto/user.dto';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const verifyRegisterUserSchema = userSchema.pick({ email: true }).extend({
  otp: z.coerce.number().max(999999),
});

export class VerifyRegisterUserDto extends createZodDto(
  verifyRegisterUserSchema,
) {}
