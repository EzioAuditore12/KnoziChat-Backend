import { ALERT } from "../../../constants/events.js";
import { db } from "../../../db/index.js";
import { chatMembersTable, chatsTable } from "../../../db/models/chats.model.js";
import { usersTable } from "../../../db/models/users.model.js";
import { HTTPStatusCode } from "../../../lib/constants.js";
import { emitEvent } from "../../../utils/socket-io.js";
import { and, eq, inArray } from "drizzle-orm";
export const removeGroupMembers = async (c) => {
    const { chatId, membersID } = c.req.valid("json");
    // Check if chat exists and is a group chat
    const [chat] = await db
        .select()
        .from(chatsTable)
        .where(and(eq(chatsTable.id, chatId), eq(chatsTable.groupChat, true)));
    if (!chat) {
        return c.json({ message: "No group chat found with this id" }, HTTPStatusCode.NOT_FOUND);
    }
    // Validate all members exist
    const existingUsers = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(inArray(usersTable.id, membersID));
    if (existingUsers.length !== membersID.length) {
        return c.json({ message: "One or more members are not registered users" }, HTTPStatusCode.NOT_FOUND);
    }
    // Find members that are actually in the chat
    const existingMembers = await db
        .select({ userId: chatMembersTable.userId })
        .from(chatMembersTable)
        .where(and(eq(chatMembersTable.chatId, chatId), inArray(chatMembersTable.userId, membersID)));
    const memberIdsInChat = new Set(existingMembers.map((m) => m.userId));
    const membersToRemove = membersID.filter((id) => memberIdsInChat.has(id));
    if (membersToRemove.length === 0) {
        return c.json({ message: "None of the provided members are in the group" }, HTTPStatusCode.NOT_FOUND);
    }
    // Remove members from chat
    await db
        .delete(chatMembersTable)
        .where(and(eq(chatMembersTable.chatId, chatId), inArray(chatMembersTable.userId, membersToRemove)));
    emitEvent(c, ALERT, membersToRemove, `You have been removed from ${chat.name}`);
    return c.json({ removedMembers: membersToRemove }, HTTPStatusCode.OK);
};
