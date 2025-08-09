import { addGroupMembers } from "./add-group-members.js";
import { createNewGroupChat } from "./create-group-chat.js";
import { getMyGroupChats } from "./get-my-group-chat.js";
import { leaveGroup } from "./leave-group.js";
import { removeGroupMembers } from "./remove-group-members.js";
import { renameGroupName } from "./rename-group.js";
export const GroupChatHandlers = {
    createNewGroupChat,
    getMyGroupChats,
    addGroupMembers,
    removeGroupMembers,
    leaveGroup,
    renameGroupName,
};
