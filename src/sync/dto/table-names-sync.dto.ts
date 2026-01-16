import { z } from 'zod';

export const tableNamesSyncSchema = z.enum([
  'conversations',
  'direct_chats',
  'users',
]);
