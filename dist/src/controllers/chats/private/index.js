import { respondToRequest } from "./accept-request.js";
import { createPrivateChat } from "./create-private-chat.js";
import { getAllNotifications } from "./get-all-notifcations.js";
import { retreiveChats } from "./retreive-all-chats.js";
import { searchChats } from "./search-chats.js";
import { sendFriendRequest } from "./send-friend-request.js";
export const PrivateChatsHandlers = {
    retreiveChats,
    createPrivateChat,
    searchChats,
    respondToRequest,
    sendFriendRequest,
    getAllNotifications,
};
