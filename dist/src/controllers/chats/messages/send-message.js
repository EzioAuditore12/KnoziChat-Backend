import { NEW_MESSAGE_ALERT } from "../../../constants/events.js";
import { db } from "../../../db/index.js";
import { chatMembersTable, chatsTable } from "../../../db/models/chats.model.js";
import { messageTable } from "../../../db/models/messages.model.js";
import { usersTable } from "../../../db/models/users.model.js";
import { HTTPStatusCode } from "../../../lib/constants.js";
import { emitEvent } from "../../../utils/socket-io.js";
import { and, eq } from "drizzle-orm";
export const sendMessage = async (c) => {
    const userId = c.get("userId");
    const { chatId, content } = c.req.valid("json");
    // Check if chat exists
    const chat = await db
        .select()
        .from(chatsTable)
        .where(eq(chatsTable.id, chatId))
        .limit(1);
    if (chat.length === 0) {
        return c.json({
            status: false,
            message: "Chat not found",
        }, HTTPStatusCode.NOT_FOUND);
    }
    // Check if user is a member of the chat
    const membership = await db
        .select()
        .from(chatMembersTable)
        .where(and(eq(chatMembersTable.chatId, chatId), eq(chatMembersTable.userId, userId)))
        .limit(1);
    if (membership.length === 0) {
        return c.json({
            status: false,
            message: "You are not a member of this chat",
        }, HTTPStatusCode.UNAUTHORIZED);
    }
    // Get sender info
    const sender = await db
        .select({
        id: usersTable.id,
        name: usersTable.firstName,
        profilePicture: usersTable.profilePicture,
    })
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1);
    // Create the message
    const [newMessage] = await db
        .insert(messageTable)
        .values({
        senderId: userId,
        chatId,
        content,
        attachements: null,
    })
        .returning();
    // Get all chat members for real-time notification
    const chatMembers = await db
        .select({ userId: chatMembersTable.userId })
        .from(chatMembersTable)
        .where(eq(chatMembersTable.chatId, chatId));
    const memberIds = chatMembers
        .map((member) => member.userId)
        .filter((id) => id !== userId); // Exclude sender
    // Prepare message data
    const messageData = {
        id: newMessage.id,
        content: newMessage.content,
        senderId: newMessage.senderId,
        chatId: newMessage.chatId,
        createdAt: newMessage.createdAt?.toISOString() || new Date().toISOString(),
        attachments: null,
        sender: {
            id: sender[0].id,
            name: sender[0].name,
            profilePicture: sender[0].profilePicture,
        },
    };
    // Notify other members about new message
    emitEvent(c, NEW_MESSAGE_ALERT, memberIds, messageData);
    return c.json({
        status: true,
        message: "Message sent successfully",
        data: messageData,
    }, HTTPStatusCode.CREATED);
};
