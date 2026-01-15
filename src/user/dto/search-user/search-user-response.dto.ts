import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

import { publicUserSchema } from '../public-user.dto';

import {
  linkPaginatedSchema,
  metaPaginatedSchema,
} from 'src/common/dto/pagination.dto';

export const searchUserResponseSchema = z.object({
  data: z.array(publicUserSchema),
  meta: metaPaginatedSchema,
  links: linkPaginatedSchema,
});

export class SerachUserResponseDto extends createZodDto(
  searchUserResponseSchema,
) {}
