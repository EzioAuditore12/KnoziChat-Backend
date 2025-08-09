import { HTTPStatusCode, notFoundSchema, unauthorizedRequestSchema, } from "../../lib/constants.js";
import { authMiddleware } from "../../middlewares/auth-middleware.js";
import { createRoute, z } from "@hono/zod-openapi";
import { jsonContent } from "stoker/openapi/helpers";
import { IdUUIDParamsSchema } from "stoker/openapi/schemas";
const fileSizeLimit = 5 * 1024 * 1024;
const mediaSchema = z
    .instanceof(File)
    .refine((file) => ["image/png", "image/jpeg", "image/jpg"].includes(file.type), {
    message: "Invalid document file",
})
    .refine((file) => file.size <= fileSizeLimit, {
    message: "File should not exceed more than 5 mb",
});
const uploadedAttachmentSchema = z.object({
    fileId: z.string(),
    fileName: z.string(),
    fileSize: z.number(),
    previewUrl: z.string(),
    viewUrl: z.string(),
    downloadUrl: z.string(),
});
const senderSchema = z.object({
    id: z.string(),
    name: z.string(),
    profilePicture: z.string().nullable(),
});
const messageSchema = z.object({
    id: z.string(),
    content: z.string().nullable(),
    senderId: z.string(),
    chatId: z.string(),
    createdAt: z.string(),
    attachments: z.array(uploadedAttachmentSchema).nullable(),
    sender: senderSchema,
});
const getMessagesResponseSchema = z.object({
    status: z.boolean(),
    message: z.string(),
    messages: z.array(messageSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
});
const messageResponseSchema = z.object({
    message: z.object({
        content: z.string(),
        uploadedAttachments: z.array(uploadedAttachmentSchema),
        sender: senderSchema,
        chat: z.string(),
    }),
});
// Send text message
export const sendMessage = createRoute({
    tags: ["Chat"],
    method: "post",
    path: "/send-message",
    middleware: [authMiddleware],
    request: {
        body: jsonContent(z.object({
            chatId: z.string().uuid(),
            content: z.string().min(1).max(1000),
        }), "Send message request"),
    },
    responses: {
        [HTTPStatusCode.CREATED]: jsonContent(z.object({
            status: z.boolean(),
            message: z.string(),
            data: messageSchema,
        }), "Message sent successfully"),
        [HTTPStatusCode.NOT_FOUND]: jsonContent(notFoundSchema, "Chat not found"),
        [HTTPStatusCode.UNAUTHORIZED]: jsonContent(unauthorizedRequestSchema, "User is not a member of this chat"),
    },
});
export const sendAttachements = createRoute({
    tags: ["Chat"],
    method: "post",
    path: "/send-attachment",
    middleware: [authMiddleware],
    request: {
        body: {
            content: {
                "multipart/form-data": {
                    schema: z.object({
                        chatId: z.string().uuid(),
                        attachments: z
                            .union([mediaSchema, z.array(mediaSchema).min(1)])
                            .transform((val) => (Array.isArray(val) ? val : [val])),
                    }),
                },
            },
        },
    },
    responses: {
        [HTTPStatusCode.CREATED]: jsonContent(messageResponseSchema, "Attachment added successfully"),
        [HTTPStatusCode.NOT_FOUND]: jsonContent(notFoundSchema, "Given chat id does not exist"),
        [HTTPStatusCode.UNAUTHORIZED]: jsonContent(unauthorizedRequestSchema, "Given user is not a member of the group"),
    },
});
// get messages
export const getMessages = createRoute({
    tags: ["Chat"],
    method: "get",
    path: "/messages/{id}",
    middleware: [authMiddleware],
    request: {
        params: IdUUIDParamsSchema,
        query: z.object({
            page: z.coerce.number().int().min(1).default(1),
            limit: z.coerce.number().int().min(1).max(100).default(10),
        }),
    },
    responses: {
        [HTTPStatusCode.OK]: jsonContent(getMessagesResponseSchema, "Messages retrieved successfully"),
        [HTTPStatusCode.NOT_FOUND]: jsonContent(notFoundSchema, "Chat not found"),
        [HTTPStatusCode.UNAUTHORIZED]: jsonContent(unauthorizedRequestSchema, "User is not a member of this chat"),
    },
});
export const MessageRoutes = {
    sendMessage,
    sendAttachements,
    getMessages,
};
