import { respondToRequest } from "./accept-request";
import { createPrivateChat } from "./create-private-chat";
import { getAllNotifications } from "./get-all-notifcations";
import { retreiveChats } from "./retreive-all-chats";
import { searchChats } from "./search-chats";
import { sendFriendRequest } from "./send-friend-request";

export const PrivateChatsHandlers = {
	retreiveChats,
	createPrivateChat,
	searchChats,
	respondToRequest,
	sendFriendRequest,
	getAllNotifications,
};
