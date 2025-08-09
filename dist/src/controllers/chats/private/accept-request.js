import { ALERT, REFETCH_CHATS } from "../../../constants/events.js";
import { db } from "../../../db/index.js";
import { chatMembersTable, chatsTable } from "../../../db/models/chats.model.js";
import { requestsTable } from "../../../db/models/requests.model.js";
import { usersTable } from "../../../db/models/users.model.js";
import { HTTPStatusCode } from "../../../lib/constants.js";
import { emitEvent } from "../../../utils/socket-io.js";
import { eq } from "drizzle-orm";
export const respondToRequest = async (c) => {
    const userId = c.get("userId");
    const { id: requestId } = c.req.valid("param");
    const { action } = c.req.valid("json");
    // Get the request with sender info
    const request = await db
        .select({
        id: requestsTable.id,
        status: requestsTable.status,
        senderId: requestsTable.sender,
        receiverId: requestsTable.receiver,
        senderName: usersTable.firstName,
    })
        .from(requestsTable)
        .innerJoin(usersTable, eq(requestsTable.sender, usersTable.id))
        .where(eq(requestsTable.id, requestId))
        .limit(1);
    if (request.length === 0) {
        return c.json({
            status: false,
            message: "Friend request not found",
        }, HTTPStatusCode.NOT_FOUND);
    }
    const friendRequest = request[0];
    // Check if user is the receiver of this request
    if (friendRequest.receiverId !== userId) {
        return c.json({
            status: false,
            message: "You are not authorized to respond to this request",
        }, HTTPStatusCode.UNAUTHORIZED);
    }
    // Check if request is still pending
    if (friendRequest.status !== "pending") {
        return c.json({
            status: false,
            message: `Request has already been ${friendRequest.status}`,
        }, HTTPStatusCode.BAD_REQUEST);
    }
    let chatId;
    if (action === "accept") {
        // Create private chat between users
        const [newChat] = await db
            .insert(chatsTable)
            .values({
            name: null, // Private chats don't have names
            avatar: null,
            creatorId: userId,
            groupChat: false,
        })
            .returning();
        chatId = newChat.id;
        // Add both users as members
        await db.insert(chatMembersTable).values([
            {
                chatId: newChat.id,
                userId: friendRequest.senderId,
            },
            {
                chatId: newChat.id,
                userId: friendRequest.receiverId,
            },
        ]);
        // Update request status to accepted
        await db
            .update(requestsTable)
            .set({ status: "accepted" })
            .where(eq(requestsTable.id, requestId));
        // Notify both users about the new chat
        emitEvent(c, REFETCH_CHATS, [friendRequest.senderId], "Friend request accepted! New chat created.");
        emitEvent(c, ALERT, [friendRequest.senderId], `${friendRequest.senderName} accepted your friend request!`);
        return c.json({
            status: true,
            message: "Friend request accepted successfully",
            chatId,
        }, HTTPStatusCode.OK);
    }
    // Reject the request
    await db
        .update(requestsTable)
        .set({ status: "rejected" })
        .where(eq(requestsTable.id, requestId));
    // Optionally notify sender about rejection
    emitEvent(c, ALERT, [friendRequest.senderId], "Your friend request was declined");
    return c.json({
        status: true,
        message: "Friend request rejected successfully",
    }, HTTPStatusCode.OK);
};
