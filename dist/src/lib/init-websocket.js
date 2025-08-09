import { randomUUID as uuid } from "node:crypto";
import { NEW_MESSAGE, NEW_MESSAGE_ALERT } from "../constants/events.js";
import { db } from "../db/index.js";
import { chatsTable } from "../db/models/chats.model.js"; // You'll need to import your chat model
import { chatMembersTable } from "../db/models/chats.model.js";
import { messageTable } from "../db/models/messages.model.js";
import { parseAccessToken } from "../utils/jwt.js";
import { eq } from "drizzle-orm";
import { Server } from "socket.io";
const userSocketIDs = new Map();
export function initWebSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*",
        },
    });
    // Authentication middleware for Socket.IO
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.headers.authorization?.split(" ")[1];
            if (!token) {
                return next(new Error("Authentication token is required"));
            }
            const decoded = await parseAccessToken(token);
            if (!decoded) {
                return next(new Error("TOKEN_EXPIRED"));
            }
            // Attach user info to socket
            socket.data.user = {
                _id: decoded.id,
            };
            next();
        }
        catch (error) {
            next(new Error("Authentication failed"));
        }
    });
    io.on("error", (err) => {
        console.log(err);
    });
    io.on("connection", (socket) => {
        const user = socket.data.user;
        // FIX: Use _id consistently
        userSocketIDs.set(user._id, socket.id);
        console.log(`User ${user._id} connected with socket ${socket.id}`);
        // Handle disconnect
        socket.on("disconnect", () => {
            userSocketIDs.delete(user._id);
            console.log(`User ${user._id} disconnected`);
        });
        socket.on(NEW_MESSAGE, async ({ chatId, message }) => {
            // Remove members requirement
            try {
                // Fetch chat members from database
                const chatData = await db
                    .select()
                    .from(chatsTable)
                    .where(eq(chatsTable.id, chatId))
                    .limit(1);
                if (!chatData.length) {
                    console.error("Chat not found:", chatId);
                    return;
                }
                // Extract members from chat data
                // Fetch members from a separate table or relation
                // Example: Assuming you have a chatMembersTable with chatId and userId fields
                const chatMembers = await db
                    .select()
                    .from(chatMembersTable)
                    .where(eq(chatMembersTable.chatId, chatId));
                const members = chatMembers.map((cm) => cm.userId);
                // Create message for real-time broadcast
                const messageForRealTime = {
                    id: uuid(), // Change _id to id to match frontend
                    content: message,
                    sender: {
                        id: user._id, // Change _id to id to match frontend
                    },
                    chatId: chatId, // Change chat to chatId to match frontend
                    createdAt: new Date().toISOString(),
                };
                // Get socket IDs for all members in the chat
                const membersSockets = getSockets(members);
                // Broadcast to all members
                io.to(membersSockets).emit(NEW_MESSAGE, {
                    chatId,
                    message: messageForRealTime,
                });
                io.to(membersSockets).emit(NEW_MESSAGE_ALERT, { chatId });
                // Save to database
                await db.insert(messageTable).values({
                    chatId: chatId,
                    senderId: user._id,
                    content: message,
                });
                console.log("New Message sent:", messageForRealTime);
                console.log("Sent to sockets:", membersSockets);
            }
            catch (error) {
                console.error("Error handling message:", error);
                socket.emit("error", { message: "Failed to send message" });
            }
        });
    });
    return io;
}
// Function to get socket IDs for an array of user IDs
export const getSockets = (users) => {
    const sockets = users
        .map((user) => userSocketIDs.get(user.toString()))
        .filter(Boolean);
    return sockets;
};
// Additional helper functions
export function getSocketId(userId) {
    return userSocketIDs.get(userId);
}
export function getAllOnlineUsers() {
    return Array.from(userSocketIDs.keys());
}
export function isUserOnline(userId) {
    return userSocketIDs.has(userId);
}
