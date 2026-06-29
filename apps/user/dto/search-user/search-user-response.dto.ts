import {
  linkPaginatedSchema,
  metaPaginatedSchema,
} from 'apps/common/dto/pagination.dto';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { publicUserSchema } from '../public-user.dto';

export const searchUserResponseSchema = z.object({
  data: z.array(publicUserSchema),
  meta: metaPaginatedSchema,
  links: linkPaginatedSchema,
});

export class SerachUserResponseDto extends createZodDto(
  searchUserResponseSchema,
) {}
