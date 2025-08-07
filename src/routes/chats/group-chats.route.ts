import {
	createNewGroupChatResponse,
	createNewGroupChatValidationRequestBody,
	retreiveChatResponse,
} from "@/validations/app/chats/group-chats";
import { createRoute, z } from "@hono/zod-openapi";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";

import {
	HTTPStatusCode,
	badRequestSchema,
	notFoundSchema,
} from "@/lib/constants";
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

export const addGroupMembers = createRoute({
	tags: ["Chat"],
	method: "put",
	path: "/add-members",
	middleware: [authMiddleware],
	request: {
		body: jsonContentRequired(
			z.object({
				chatId: z.string().uuid(),
				members: z.array(z.string().uuid()).min(1),
			}),
			"Request body for adding member",
		),
	},
	responses: {
		[HTTPStatusCode.CREATED]: jsonContent(
			z.object({
				message: z.string(),
			}),
			"Group Members added successfully",
		),
		[HTTPStatusCode.NOT_FOUND]: jsonContent(
			notFoundSchema,
			"User not registered with us",
		),
		[HTTPStatusCode.BAD_REQUEST]: jsonContent(
			badRequestSchema,
			"All provided user already exists in a group",
		),
	},
});

export const removeGroupMembers = createRoute({
	tags: ["Chat"],
	method: "delete",
	path: "/remove-members",
	middleware: [authMiddleware],
	request: {
		body: jsonContentRequired(
			z.object({
				chatId: z.string().uuid(),
				membersID: z.array(z.string().uuid()).min(1),
			}),
			"Request Body for removing one or more members",
		),
	},
	responses: {
		[HTTPStatusCode.OK]: jsonContent(
			z.object({
				removedMembers: z.array(z.string().uuid()),
			}),
			"Members removed successfully",
		),
		[HTTPStatusCode.NOT_FOUND]: jsonContent(
			notFoundSchema,
			"User Id , Chat ID or member is not associated with the chat",
		),
	},
});

export type CreateNewGroupChat = typeof createNewGroupChat;
export type GetMyGroupChats = typeof getMyGroupChats;
export type AddGroupMembers = typeof addGroupMembers;
export type RemoveGroupMembers = typeof removeGroupMembers;

export const GroupChatRoutes = {
	createNewGroupChat,
	getMyGroupChats,
	addGroupMembers,
	removeGroupMembers,
};
