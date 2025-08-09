import { db } from "../../../db/index.js";
import { requestsTable } from "../../../db/models/requests.model.js";
import { usersTable } from "../../../db/models/users.model.js";
import { HTTPStatusCode } from "../../../lib/constants.js";
import { and, eq, or } from "drizzle-orm";
export const getAllNotifications = async (c) => {
    const userId = c.get("userId");
    const { page, limit, status } = c.req.valid("query");
    const offset = (page - 1) * limit;
    // Build query conditions
    let whereConditions = or(eq(requestsTable.sender, userId), eq(requestsTable.receiver, userId));
    if (status) {
        whereConditions = and(whereConditions, eq(requestsTable.status, status));
    }
    // Get total count for pagination
    const totalNotifications = await db
        .select()
        .from(requestsTable)
        .where(whereConditions);
    const total = totalNotifications.length;
    // Get paginated notifications with sender and receiver info
    const notifications = await db
        .select({
        id: requestsTable.id,
        status: requestsTable.status,
        senderId: requestsTable.sender,
        receiverId: requestsTable.receiver,
        createdAt: requestsTable.createdAt,
        senderName: usersTable.firstName,
        senderProfilePicture: usersTable.profilePicture,
    })
        .from(requestsTable)
        .innerJoin(usersTable, eq(requestsTable.sender, usersTable.id))
        .where(whereConditions)
        .orderBy(requestsTable.createdAt)
        .limit(limit)
        .offset(offset);
    // Get receiver info for each notification
    const receiverIds = [...new Set(notifications.map((n) => n.receiverId))];
    const receivers = await db
        .select({
        id: usersTable.id,
        name: usersTable.firstName,
        profilePicture: usersTable.profilePicture,
    })
        .from(usersTable)
        .where(or(...receiverIds.map((id) => eq(usersTable.id, id))));
    // Create lookup map for receivers
    const receiverMap = receivers.reduce((acc, receiver) => {
        acc[receiver.id] = receiver;
        return acc;
    }, {});
    // Format the response
    const formattedNotifications = notifications.map((notification) => ({
        id: notification.id,
        status: notification.status,
        sender: {
            id: notification.senderId,
            name: notification.senderName,
            profilePicture: notification.senderProfilePicture,
        },
        receiver: {
            id: notification.receiverId,
            name: receiverMap[notification.receiverId]?.name || "Unknown",
            profilePicture: receiverMap[notification.receiverId]?.profilePicture || null,
        },
        createdAt: notification.createdAt?.toISOString() || new Date().toISOString(),
    }));
    return c.json({
        status: true,
        message: "Notifications retrieved successfully",
        notifications: formattedNotifications,
        total,
        page,
        limit,
    }, HTTPStatusCode.OK);
};
