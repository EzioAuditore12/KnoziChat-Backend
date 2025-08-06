import {
	createNewGroupChatResponse,
	createNewGroupChatValidationRequestBody,
	retreiveChatResponse,
} from "@/validations/app/chats/group-chats";
import { createRoute } from "@hono/zod-openapi";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";

import { HTTPStatusCode, badRequestSchema } from "@/lib/constants";
import { authMiddleware } from "@/middlewares/auth-middleware";

export const createNewGroupChat = createRoute({
	tags: ["Chat"],
	path: "/create-group-chat",
	method: "post",
	middleware: [authMiddleware],
	request: {
		body: jsonContentRequired(
			createNewGroupChatValidationRequestBody,
			"Create Group Chat",
		),
	},
	responses: {
		[HTTPStatusCode.CREATED]: jsonContent(
			createNewGroupChatResponse,
			"Chat created successfully",
		),
		[HTTPStatusCode.BAD_REQUEST]: jsonContent(
			badRequestSchema,
			"Members array consisting of non registered users",
		),
	},
});

export const getMyGroupChats = createRoute({
	tags: ["Chat"],
	method: "get",
	path: "/get-groups",
	middleware: [authMiddleware],
	responses: {
		[HTTPStatusCode.OK]: jsonContent(
			retreiveChatResponse,
			"Group Chats retreived successfully",
		),
	},
});

export type CreateNewGroupChat = typeof createNewGroupChat;
export type GetMyGroupChats = typeof getMyGroupChats;
