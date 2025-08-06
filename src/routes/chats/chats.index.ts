import { createProtectedRouter } from "@/lib/create-app";

import {
	GroupChatHandlers,
	GroupChatRoutes,
} from "./group-chat/group-chats.index";
import {
	retreiveChatRoutes,
	retreiveChatsHandlers,
} from "./retreive-chats/retreive-chat.index";

const chats = createProtectedRouter()
	.openapi(
		GroupChatRoutes.createNewGroupChat,
		GroupChatHandlers.createNewGroupChat,
	)
	.openapi(
		retreiveChatRoutes.retreiveChats,
		retreiveChatsHandlers.retreiveChats,
	)
	.openapi(GroupChatRoutes.getMyGroupChats, GroupChatHandlers.getMyGroupChats);

export default chats;
