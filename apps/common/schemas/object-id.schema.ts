import { Types } from 'mongoose';
import { z } from 'zod';

export const objectIdSchema = z
  .any()
  .refine((val) => Types.ObjectId.isValid(val), { message: 'Invalid ObjectId' })
  .transform((val) => new Types.ObjectId(val));

export type ObjectId = z.infer<typeof objectIdSchema>;
