import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const chatAttachmentSyncSchema = z.object({
  id: z.any().transform((val) => String(val)),
  remoteUrl: z.url().nullable(),
});

export const chatsAttachmentSyncChangeSchema = z.object({
  created: chatAttachmentSyncSchema.array(),
  updated: chatAttachmentSyncSchema.array(),
  deleted: z.array(z.string()),
});

export class ChatsAttachmentSyncDto extends createZodDto(
  chatAttachmentSyncSchema,
) {}

export class ChatsAttachmentSyncChangeDto extends createZodDto(
  chatsAttachmentSyncChangeSchema,
) {}
