import { Server } from 'socket.io';
import { NEW_MESSAGE, NEW_MESSAGE_ALERT } from '../constants/events.js';
import { randomUUID as uuid } from "node:crypto";
import { db } from '../db/index.js';
import { messageTable } from '../db/models/messages.model.js';
const userSocketIDs = new Map();
export function initWebSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*",
        }
    });
    io.use((socket, next) => { });
    io.on("error", (err) => {
        console.log(err);
    });
    io.on('connection', (socket) => {
        const user = {
            _id: "ds",
            name: "Daksh"
        };
        userSocketIDs.set(user._id, socket.id);
        console.log(userSocketIDs);
        // Handle disconnect
        socket.on('disconnect', () => {
            userSocketIDs.delete(user._id);
            console.log(`User ${user._id} disconnected`);
        });
        socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
            const messageForRealTime = {
                content: message,
                _id: uuid(),
                sender: {
                    _id: user._id,
                    name: user.name
                },
                chat: chatId,
                createdAt: new Date().toISOString()
            };
            // Get socket IDs for all members in the chat
            const membersSockets = getSockets(members);
            io.to(membersSockets).emit(NEW_MESSAGE, {
                chatId,
                message: messageForRealTime
            });
            io.to(membersSockets).emit(NEW_MESSAGE_ALERT, { chatId });
            const messageForDB = {
                content: message,
                senderId: user._id,
                chatId: chatId
            };
            console.log("New Message", messageForRealTime);
            console.log("Sent to sockets:", membersSockets);
            await db.insert(messageTable).values({
                chatId: messageForDB.chatId,
                senderId: messageForDB.senderId,
                content: messageForDB.content,
            });
        });
    });
}
// Function to get socket IDs for an array of user IDs
export const getSockets = (users) => {
    const sockets = users.map((user) => userSocketIDs.get(user.toString())).filter(Boolean);
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
