import { createProtectedRouter } from "../../lib/create-app.js";
import { GroupChatHandlers } from "../../controllers/chats/group-chats/index.js";
import { GroupChatRoutes } from "./group-chats.route.js";
import { PrivateChatsHandlers } from "../../controllers/chats/private/index.js";
import { PrivateChatRoutes } from "./private-chat.route.js";
import { MessageRequestsHandler } from "../../controllers/chats/messages/index.js";
import { MessageRoutes } from "./messages.routes.js";
import { ChatQueryRequestsHandlers } from "../../controllers/chats/chat-queries/index.js";
import { ChatQueryRoutes } from "./chat-queries.route.js";
const chats = createProtectedRouter()
    .openapi(GroupChatRoutes.createNewGroupChat, GroupChatHandlers.createNewGroupChat)
    .openapi(GroupChatRoutes.getMyGroupChats, GroupChatHandlers.getMyGroupChats)
    .openapi(GroupChatRoutes.addGroupMembers, GroupChatHandlers.addGroupMembers)
    .openapi(GroupChatRoutes.removeGroupMembers, GroupChatHandlers.removeGroupMembers)
    .openapi(GroupChatRoutes.leaveGroup, GroupChatHandlers.leaveGroup)
    .openapi(GroupChatRoutes.renameGroupName, GroupChatHandlers.renameGroupName)
    .openapi(PrivateChatRoutes.retreiveChats, PrivateChatsHandlers.retreiveChats)
    .openapi(PrivateChatRoutes.createPrivateChat, PrivateChatsHandlers.createPrivateChat)
    .openapi(PrivateChatRoutes.searchPrivateChats, PrivateChatsHandlers.searchChats)
    .openapi(PrivateChatRoutes.sendFriendRequest, PrivateChatsHandlers.sendFriendRequest)
    .openapi(PrivateChatRoutes.respondToRequest, PrivateChatsHandlers.respondToRequest)
    .openapi(PrivateChatRoutes.getAllNotifications, PrivateChatsHandlers.getAllNotifications)
    .openapi(MessageRoutes.sendAttachements, MessageRequestsHandler.sendAttachements)
    .openapi(MessageRoutes.sendMessage, MessageRequestsHandler.sendMessage)
    .openapi(MessageRoutes.getMessages, MessageRequestsHandler.getMessages)
    .openapi(ChatQueryRoutes.getChatDetails, ChatQueryRequestsHandlers.getChatDetails);
export default chats;
