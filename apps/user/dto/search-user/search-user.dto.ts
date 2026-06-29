import { paginationSchema } from 'apps/common/dto/pagination.dto';
import { createZodDto } from 'nestjs-zod';

const searchUserSchema = paginationSchema;

export class SearchUserDto extends createZodDto(searchUserSchema) {}
