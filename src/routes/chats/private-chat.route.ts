import {
	HTTPStatusCode,
	badRequestSchema,
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

export const searchPrivateChats = createRoute({
	tags: ["Chat"],
	method: "get",
	path: "/search-chats",
	middleware: [authMiddleware],
	request: {
		query: z.object({
			name: z.string().min(1).max(50),
			page: z.coerce.number().int().min(1).default(1),
			limit: z.coerce.number().int().min(1).max(50).default(10),
		}),
	},
	responses: {
		[HTTPStatusCode.OK]: jsonContent(
			z.object({
				status: z.boolean(),
				message: z.string(),
				chats: z.array(
					z.object({
						id: z.string(),
						name: z.string(),
						avatar: z.string(),
						creatorId: z.string(),
						groupChat: z.boolean(),
						createdAt: z.string().nullable(),
						members: z.array(
							z.object({
								id: z.string(),
								name: z.string(),
								profilePicture: z.string(),
							}),
						),
					}),
				),
				total: z.number(),
				page: z.number(),
				limit: z.number(),
			}),
			"Chats searched successfully",
		),
	},
});

// Send friend request
export const sendFriendRequest = createRoute({
	tags: ["Friend Requests"],
	method: "post",
	path: "/send-request",
	middleware: [authMiddleware],
	request: {
		body: jsonContentRequired(
			z.object({
				receiverId: z.string().uuid(),
			}),
			"Send friend request",
		),
	},
	responses: {
		[HTTPStatusCode.CREATED]: jsonContent(
			z.object({
				status: z.boolean(),
				message: z.string(),
				requestId: z.string(),
			}),
			"Friend request sent successfully",
		),
		[HTTPStatusCode.NOT_FOUND]: jsonContent(notFoundSchema, "User not found"),
		[HTTPStatusCode.CONFLICT]: jsonContent(
			conflictRequestSchema,
			"Request already exists or users are already friends",
		),
	},
});

// Accept/Reject friend request
export const respondToRequest = createRoute({
	tags: ["Friend Requests"],
	method: "patch",
	path: "/respond-request/{id}",
	middleware: [authMiddleware],
	request: {
		params: z.object({
			id: z.string().uuid(),
		}),
		body: jsonContentRequired(
			z.object({
				action: z.enum(["accept", "reject"]),
			}),
			"Respond to friend request",
		),
	},
	responses: {
		[HTTPStatusCode.OK]: jsonContent(
			z.object({
				status: z.boolean(),
				message: z.string(),
				chatId: z.string().uuid().optional(),
			}),
			"Request processed successfully",
		),
		[HTTPStatusCode.BAD_REQUEST]: jsonContent(
			badRequestSchema,
			"Request already processed",
		),
		[HTTPStatusCode.NOT_FOUND]: jsonContent(
			notFoundSchema,
			"Request not found",
		),
		[HTTPStatusCode.UNAUTHORIZED]: jsonContent(
			z.object({
				status: z.boolean(),
				message: z.string(),
			}),
			"Unauthorized to respond to this request",
		),
	},
});

// Get all notifications (friend requests)
export const getAllNotifications = createRoute({
	tags: ["Friend Requests"],
	method: "get",
	path: "/notifications",
	middleware: [authMiddleware],
	request: {
		query: z.object({
			page: z.coerce.number().int().min(1).default(1),
			limit: z.coerce.number().int().min(1).max(50).default(10),
			status: z.enum(["pending", "accepted", "rejected"]).optional(),
		}),
	},
	responses: {
		[HTTPStatusCode.OK]: jsonContent(
			z.object({
				status: z.boolean(),
				message: z.string(),
				notifications: z.array(
					z.object({
						id: z.string(),
						status: z.enum(["pending", "accepted", "rejected"]),
						sender: z.object({
							id: z.string(),
							name: z.string(),
							profilePicture: z.string().nullable(),
						}),
						receiver: z.object({
							id: z.string(),
							name: z.string(),
							profilePicture: z.string().nullable(),
						}),
						createdAt: z.string(),
					}),
				),
				total: z.number(),
				page: z.number(),
				limit: z.number(),
			}),
			"Notifications retrieved successfully",
		),
	},
});

export type RetreiveChats = typeof retreiveChats;
export type CreatePrivateChats = typeof createPrivateChat;
export type SearchPrivateChats = typeof searchPrivateChats;
export type SendFriendRequest = typeof sendFriendRequest;
export type RespondToRequest = typeof respondToRequest;
export type GetAllNotifications = typeof getAllNotifications;

export const PrivateChatRoutes = {
	retreiveChats,
	createPrivateChat,
	searchPrivateChats,
	sendFriendRequest,
	respondToRequest,
	getAllNotifications,
};
