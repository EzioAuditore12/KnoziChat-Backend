import { db } from "../../../db/index.js";
import { chatMembersTable, chatsTable } from "../../../db/models/chats.model.js";
import { HTTPStatusCode } from "../../../lib/constants.js";
import { and, eq } from "drizzle-orm";
export const leaveGroup = async (c) => {
    const userId = c.get("userId");
    const { id: chatID } = c.req.valid("param");
    const [chat] = await db
        .select()
        .from(chatsTable)
        .where(eq(chatsTable.id, chatID));
    if (!chat) {
        return c.json({ message: "Given chat with this id does not exist" }, HTTPStatusCode.NOT_FOUND);
    }
    if (!chat.groupChat === true) {
        return c.json({ message: "Given chat is not a group chat" }, HTTPStatusCode.BAD_REQUEST);
    }
    const [member] = await db
        .select()
        .from(chatMembersTable)
        .where(and(eq(chatMembersTable.chatId, chatID), eq(chatMembersTable.userId, userId)));
    if (!member) {
        return c.json({ message: "User is not a member of this chat" }, HTTPStatusCode.BAD_REQUEST);
    }
    await db
        .delete(chatMembersTable)
        .where(and(eq(chatMembersTable.chatId, chatID), eq(chatMembersTable.userId, userId)));
    return c.json({
        groupId: chat.id,
        message: "User left successfully",
    }, HTTPStatusCode.OK);
};
