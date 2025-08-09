import { db } from "../../../db/index.js";
import { chatsTable } from "../../../db/models/chats.model.js";
import { chatMembersTable } from "../../../db/models/chats.model.js";
import { usersTable } from "../../../db/models/users.model.js";
import { HTTPStatusCode } from "../../../lib/constants.js";
import { eq } from "drizzle-orm";
export const getChatDetails = async (c) => {
    const { id: chatId } = c.req.valid("param");
    const [chat] = await db
        .select()
        .from(chatsTable)
        .where(eq(chatsTable.id, chatId));
    if (!chat)
        return c.json({ message: "Given chat Id not found" }, HTTPStatusCode.NOT_FOUND);
    const chatMembers = await db
        .select({
        id: usersTable.id,
        name: usersTable.firstName,
        avatar: usersTable.profilePicture,
        phoneNumber: usersTable.phoneNumber
    })
        .from(chatMembersTable)
        .innerJoin(usersTable, eq(chatMembersTable.userId, usersTable.id))
        .where(eq(chatMembersTable.chatId, chatId));
    return c.json({
        success: true,
        message: "Chat data loaded successfully",
        chat,
        chatMembers,
    }, HTTPStatusCode.OK);
};
