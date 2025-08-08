import { createProtectedRouter } from "@/lib/create-app";

import { GroupChatHandlers } from "@/controllers/chats/group-chats";
import { GroupChatRoutes } from "./group-chats.route";

import { PrivateChatsHandlers } from "@/controllers/chats/private";
import { PrivateChatRoutes } from "./private-chat.route";

import { MessageRequestsHandler } from "@/controllers/chats/messages";
import { MessageRoutes } from "./messages.routes";

import { ChatQueryRequestsHandlers } from "@/controllers/chats/chat-queries";
import { ChatQueryRoutes } from "./chat-queries.route";

const chats = createProtectedRouter()
	.openapi(
		GroupChatRoutes.createNewGroupChat,
		GroupChatHandlers.createNewGroupChat,
	)
	.openapi(GroupChatRoutes.getMyGroupChats, GroupChatHandlers.getMyGroupChats)
	.openapi(GroupChatRoutes.addGroupMembers, GroupChatHandlers.addGroupMembers)
	.openapi(
		GroupChatRoutes.removeGroupMembers,
		GroupChatHandlers.removeGroupMembers,
	)
	.openapi(GroupChatRoutes.leaveGroup, GroupChatHandlers.leaveGroup)
	.openapi(GroupChatRoutes.renameGroupName, GroupChatHandlers.renameGroupName)
	.openapi(PrivateChatRoutes.retreiveChats, PrivateChatsHandlers.retreiveChats)
	.openapi(
		PrivateChatRoutes.createPrivateChat,
		PrivateChatsHandlers.createPrivateChat,
	)
	.openapi(
		PrivateChatRoutes.searchPrivateChats,
		PrivateChatsHandlers.searchChats,
	)
	.openapi(
		PrivateChatRoutes.sendFriendRequest,
		PrivateChatsHandlers.sendFriendRequest,
	)
	.openapi(
		PrivateChatRoutes.respondToRequest,
		PrivateChatsHandlers.respondToRequest,
	)
	.openapi(
		PrivateChatRoutes.getAllNotifications,
		PrivateChatsHandlers.getAllNotifications,
	)
	.openapi(
		MessageRoutes.sendAttachements,
		MessageRequestsHandler.sendAttachements,
	)
	.openapi(MessageRoutes.sendMessage, MessageRequestsHandler.sendMessage)
	.openapi(MessageRoutes.getMessages, MessageRequestsHandler.getMessages)
	.openapi(
		ChatQueryRoutes.getChatDetails,
		ChatQueryRequestsHandlers.getChatDetails,
	);

export default chats;
