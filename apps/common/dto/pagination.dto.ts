import { z } from 'zod';

export const paginationSchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  offset: z.string().regex(/^\d+$/).transform(Number).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  sortBy: z.string().optional(),
  search: z.string().optional(),
});

export const metaPaginatedSchema = z.object({
  itemsPerPage: z.number(),
  totalItems: z.number().optional(),
  currentPage: z.number().optional(),
  totalPages: z.number().optional(),
  sortBy: z.array(z.tuple([z.string(), z.string()])),
  searchBy: z.array(z.string()),
  search: z.string().optional(),
  select: z.array(z.string()).optional(),
  filter: z
    .record(z.string(), z.union([z.string(), z.array(z.string())]))
    .optional(),
  cursor: z.string().optional(),
});

export const linkPaginatedSchema = z.object({
  first: z.string().optional(),
  previous: z.string().optional(),
  current: z.string(),
  next: z.string().optional(),
  last: z.string().optional(),
});
