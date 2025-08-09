import { db } from "../../../db/index.js";
import { chatMembersTable, chatsTable } from "../../../db/models/chats.model.js";
import { usersTable } from "../../../db/models/users.model.js";
import { HTTPStatusCode } from "../../../lib/constants.js";
import { eq } from "drizzle-orm";
export const createPrivateChat = async (c) => {
    const userId = c.get("userId");
    const { otherUserId } = c.req.valid("json");
    const [otherUser] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, otherUserId));
    if (!otherUser) {
        return c.json({ message: "Given user not found" }, HTTPStatusCode.NOT_FOUND);
    }
    const existingChats = await db
        .select()
        .from(chatsTable)
        .where(eq(chatsTable.groupChat, false));
    for (const chat of existingChats) {
        const members = await db
            .select()
            .from(chatMembersTable)
            .where(eq(chatMembersTable.chatId, chat.id));
        const memberIds = members.map((m) => m.userId);
        if (memberIds.includes(userId) &&
            memberIds.includes(otherUserId) &&
            memberIds.length === 2) {
            return c.json({ message: "Private chat already exists", chatId: chat.id }, HTTPStatusCode.CONFLICT);
        }
    }
    // Create new private chat
    const [newChat] = await db
        .insert(chatsTable)
        .values({
        name: "", // You can set a name if needed
        avatar: "",
        creatorId: userId,
        groupChat: false,
    })
        .returning();
    // Add both users as members
    await db.insert(chatMembersTable).values([
        { chatId: newChat.id, userId },
        { chatId: newChat.id, userId: otherUserId },
    ]);
    return c.json({
        message: "Private chat created",
        chatId: newChat.id,
        participants: {
            userA: userId,
            userB: otherUserId,
        },
    }, HTTPStatusCode.CREATED);
};
