import { chatsInsertSchema, chatsSelectSchema } from "../../../db/models/chats.model.js";
import { z } from "@hono/zod-openapi";
export const createNewGroupChatValidationRequestBody = chatsInsertSchema
    .extend({
    groupChat: z.literal(true),
    chatMembers: z
        .array(z.string().uuid())
        .min(2)
        .refine((arr) => new Set(arr).size === arr.length, {
        message: "chatMembers must contain unique UUIDs",
    }),
})
    .omit({ creatorId: true });
export const createNewGroupChatResponse = chatsSelectSchema.extend({
    chatMembers: z.array(z.string().uuid()),
});
export const retreiveChatResponse = z.object({
    status: z.boolean(),
    message: z.string(),
    chats: z.array(chatsSelectSchema.extend({
        members: z.array(z.object({
            id: z.string().uuid(),
            name: z.string(),
            profilePicture: z.string().url(),
        })),
    })),
});
