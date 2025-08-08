import {
	HTTPStatusCode,
	conflictRequestSchema,
	notFoundSchema,
} from "@/lib/constants";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { retreiveChatResponse } from "@/validations/app/chats/group-chats";
import { createRoute, z } from "@hono/zod-openapi";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";

export const retreiveChats = createRoute({
	tags: ["Get All Chats"],
	method: "get",
	path: "/get-my-chats",
	middleware: [authMiddleware],
	request: {
		query: z.object({
			page: z.coerce.number().int().min(1).default(1),
			limit: z.coerce.number().int().min(1).max(100).default(10),
		}),
	},
	responses: {
		[HTTPStatusCode.OK]: jsonContent(
			retreiveChatResponse,
			"Chats Retreived successfully",
		),
	},
});

export const createPrivateChat = createRoute({
	tags: ["Chat"],
	method: "post",
	path: "/create-private-chat",
	middleware: [authMiddleware],
	request: {
		body: jsonContentRequired(
			z.object({
				otherUserId: z.string().uuid(),
			}),
			"Create one on one chat",
		),
	},
	responses: {
		[HTTPStatusCode.CREATED]: jsonContent(
			z.object({
				chatId: z.string().uuid(),
				participants: z.object({
					userA: z.string().uuid(),
					userB: z.string().uuid(),
				}),
				message: z.string(),
			}),
			"Private chat created successfully",
		),
		[HTTPStatusCode.NOT_FOUND]: jsonContent(
			notFoundSchema,
			"Given user id does not exist",
		),
		[HTTPStatusCode.CONFLICT]: jsonContent(
			conflictRequestSchema,
			"Chat already exists",
		),
	},
});

export type RetreiveChats = typeof retreiveChats;
export type CreatePrivateChats = typeof createPrivateChat;

export const PrivateChatRoutes = {
	retreiveChats,
	createPrivateChat,
};
