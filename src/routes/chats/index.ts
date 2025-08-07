import { createProtectedRouter } from "@/lib/create-app";

import { GroupChatHandlers } from "@/controllers/chats/group-chats";
import { GroupChatRoutes } from "./group-chats.route";

import { PrivateChatsHandlers } from "@/controllers/chats/private-chats";
import { PrivateChatRoutes } from "./private-chat.route";

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
	.openapi(PrivateChatRoutes.retreiveChats, PrivateChatsHandlers.retreiveChats);

export default chats;
