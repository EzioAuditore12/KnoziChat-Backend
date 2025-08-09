import { ALERT } from "../../../constants/events.js";
import { db } from "../../../db/index.js";
import { chatMembersTable, chatsTable } from "../../../db/models/chats.model.js";
import { requestsTable } from "../../../db/models/requests.model.js";
import { usersTable } from "../../../db/models/users.model.js";
import { HTTPStatusCode } from "../../../lib/constants.js";
import { emitEvent } from "../../../utils/socket-io.js";
import { and, eq, or } from "drizzle-orm";
export const sendFriendRequest = async (c) => {
    const senderId = c.get("userId");
    const { receiverId } = c.req.valid("json");
    // Check if receiver exists
    const receiver = await db
        .select({
        id: usersTable.id,
        name: usersTable.firstName,
    })
        .from(usersTable)
        .where(eq(usersTable.id, receiverId))
        .limit(1);
    if (receiver.length === 0) {
        return c.json({
            status: false,
            message: "User not found",
        }, HTTPStatusCode.NOT_FOUND);
    }
    // Check if users are trying to send request to themselves
    if (senderId === receiverId) {
        return c.json({
            status: false,
            message: "Cannot send friend request to yourself",
        }, HTTPStatusCode.CONFLICT);
    }
    // Check if request already exists between these users
    const existingRequest = await db
        .select()
        .from(requestsTable)
        .where(or(and(eq(requestsTable.sender, senderId), eq(requestsTable.receiver, receiverId)), and(eq(requestsTable.sender, receiverId), eq(requestsTable.receiver, senderId))))
        .limit(1);
    if (existingRequest.length > 0) {
        return c.json({
            status: false,
            message: "Friend request already exists between these users",
        }, HTTPStatusCode.CONFLICT);
    }
    // Check if users already have a private chat (are already friends)
    const existingChat = await db
        .select({ chatId: chatMembersTable.chatId })
        .from(chatMembersTable)
        .innerJoin(chatsTable, eq(chatMembersTable.chatId, chatsTable.id))
        .where(and(eq(chatsTable.groupChat, false), eq(chatMembersTable.userId, senderId)));
    const senderChatIds = existingChat.map((c) => c.chatId);
    if (senderChatIds.length > 0) {
        const mutualChat = await db
            .select()
            .from(chatMembersTable)
            .where(and(eq(chatMembersTable.userId, receiverId), 
        // Check if receiver is in any of sender's chats
        or(...senderChatIds.map((chatId) => eq(chatMembersTable.chatId, chatId)))))
            .limit(1);
        if (mutualChat.length > 0) {
            return c.json({
                status: false,
                message: "You are already friends with this user",
            }, HTTPStatusCode.CONFLICT);
        }
    }
    // Create the friend request
    const [newRequest] = await db
        .insert(requestsTable)
        .values({
        sender: senderId,
        receiver: receiverId,
        status: "pending",
    })
        .returning();
    // Emit real-time notification to receiver
    emitEvent(c, ALERT, [receiverId], `You have a new friend request from ${receiver[0].name}`);
    return c.json({
        status: true,
        message: "Friend request sent successfully",
        requestId: newRequest.id,
    }, HTTPStatusCode.CREATED);
};
