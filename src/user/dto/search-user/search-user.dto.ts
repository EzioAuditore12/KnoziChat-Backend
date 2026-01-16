import { paginationSchema } from 'src/common/dto/pagination.dto';

import { createZodDto } from 'nestjs-zod';

const searchUserSchema = paginationSchema;

export class SearchUserDto extends createZodDto(searchUserSchema) {}
