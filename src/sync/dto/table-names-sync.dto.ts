import { z } from 'zod';

export const tableNamesSchema = z
  .enum(['CONVERSATION-ONE-TO-ONE', 'CHAT-ONE-TO-ONE', 'USER'])
  .array();
