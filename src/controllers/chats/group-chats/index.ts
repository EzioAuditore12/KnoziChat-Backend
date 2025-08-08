import { addGroupMembers } from "./add-group-members";
import { createNewGroupChat } from "./create-group-chat";
import { getMyGroupChats } from "./get-my-group-chat";
import { leaveGroup } from "./leave-group";
import { removeGroupMembers } from "./remove-group-members";

export const GroupChatHandlers = {
	createNewGroupChat,
	getMyGroupChats,
	addGroupMembers,
	removeGroupMembers,
    leaveGroup
};
