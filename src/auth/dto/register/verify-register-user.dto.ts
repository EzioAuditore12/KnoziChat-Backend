import { z } from 'zod';

import { userSchema } from 'src/user/dto/user.dto';
import { createZodDto } from 'nestjs-zod';

const verifyRegisterUserSchema = userSchema.pick({ phoneNumber: true }).extend({
  otp: z.coerce.number().max(999999),
});

export class VerifyRegisterUserDto extends createZodDto(
  verifyRegisterUserSchema,
) {}
