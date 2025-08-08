import {
	HTTPStatusCode,
	badRequestSchema,
	notFoundSchema,
	unauthorizedRequestSchema,
} from "@/lib/constants";
import { authMiddleware } from "@/middlewares/auth-middleware";
import {
	createNewGroupChatResponse,
	createNewGroupChatValidationRequestBody,
	retreiveChatResponse,
} from "@/validations/app/chats/group-chats";
import { createRoute, z } from "@hono/zod-openapi";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { IdUUIDParamsSchema } from "stoker/openapi/schemas";

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
	request: {
		query: z.object({
			page: z.coerce.number().int().min(1).default(1),
			limit: z.coerce.number().int().min(1).max(100).default(10),
		}),
	},
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

export const leaveGroup = createRoute({
	tags: ["Chat"],
	method: "delete",
	path: "/leave-group/{id}",
	middleware: [authMiddleware],
	request: {
		params: IdUUIDParamsSchema,
	},
	responses: {
		[HTTPStatusCode.OK]: jsonContent(
			z.object({
				groupId: z.string().uuid(),
				message: z.string(),
			}),
			"Left group scuessfully",
		),
		[HTTPStatusCode.BAD_REQUEST]: jsonContent(
			badRequestSchema,
			"User is not associated with this group",
		),
		[HTTPStatusCode.NOT_FOUND]: jsonContent(
			notFoundSchema,
			"Given group id does not exist",
		),
	},
});

// rename chat
export const renameGroupName = createRoute({
	tags: ["Chat"],
	method: "put",
	path: "/rename-group/{id}",
	middleware: [authMiddleware],
	request: {
		params: IdUUIDParamsSchema,
		body: jsonContent(
			z.object({
				newName: z.string(),
			}),
			"New Name for group chat",
		),
	},
	responses: {
		[HTTPStatusCode.OK]: jsonContent(
			z.object({
				groupId: z.string().uuid(),
				message: z.string(),
				newGroupName: z.string().nullable(),
			}),
			"Group Name edited successfully",
		),
		[HTTPStatusCode.BAD_REQUEST]: jsonContent(
			badRequestSchema,
			"User is not associated with this group or chat is not a group chat",
		),
		[HTTPStatusCode.NOT_FOUND]: jsonContent(
			notFoundSchema,
			"Given group id does not exist",
		),
	},
});

// delete chat
export const deleteGroupChat = createRoute({
	tags: ["Chat"],
	method: "delete",
	path: "group/{id}",
	middleware: [authMiddleware],
	request: {
		params: IdUUIDParamsSchema,
	},
	responses: {
		[HTTPStatusCode.OK]: jsonContent(
			z.object({
				groupId: z.string().uuid(),
				message: z.string(),
			}),
			"Group Name edited successfully",
		),
		[HTTPStatusCode.UNAUTHORIZED]: jsonContent(
			unauthorizedRequestSchema,
			"Only creator is allowed to delete the group",
		),
		[HTTPStatusCode.BAD_REQUEST]: jsonContent(
			badRequestSchema,
			"User is not associated with this group or chat is not a group chat",
		),
		[HTTPStatusCode.NOT_FOUND]: jsonContent(
			notFoundSchema,
			"Given group id does not exist",
		),
	},
});

export type CreateNewGroupChat = typeof createNewGroupChat;
export type GetMyGroupChats = typeof getMyGroupChats;
export type AddGroupMembers = typeof addGroupMembers;
export type RemoveGroupMembers = typeof removeGroupMembers;
export type LeaveGroup = typeof leaveGroup;
export type RenameGroupName = typeof renameGroupName;
export type DeleteGroupChat = typeof deleteGroupChat;

export const GroupChatRoutes = {
	createNewGroupChat,
	getMyGroupChats,
	addGroupMembers,
	removeGroupMembers,
	leaveGroup,
	renameGroupName,
	deleteGroupChat,
};
