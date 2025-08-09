import { randomUUID as uuid } from "node:crypto";
import { NEW_MESSAGE, NEW_MESSAGE_ALERT } from "@/constants/events";
import { db } from "@/db";
import { messageTable } from "@/db/models/messages.model";
import type { ServerType } from "@hono/node-server";
import { Server } from "socket.io";

const userSocketIDs = new Map<string, string>();

export function initWebSocket(server: ServerType) {
	const io = new Server(server, {
		cors: {
			origin: "*",
		},
	});

	io.use((socket, next) => {});

	io.on("error", (err) => {
		console.log(err);
	});

	io.on("connection", (socket) => {
		const user = {
			_id: "ds",
			name: "Daksh",
		};
		userSocketIDs.set(user._id, socket.id);
		console.log(userSocketIDs);

		// Handle disconnect
		socket.on("disconnect", () => {
			userSocketIDs.delete(user._id);
			console.log(`User ${user._id} disconnected`);
		});

		socket.on(
			NEW_MESSAGE,
			async ({
				chatId,
				members,
				message,
			}: { chatId: string; members: string[]; message: string }) => {
				const messageForRealTime = {
					content: message,
					_id: uuid(),
					sender: {
						_id: user._id,
						name: user.name,
					},
					chat: chatId,
					createdAt: new Date().toISOString(),
				};

				// Get socket IDs for all members in the chat
				const membersSockets = getSockets(members);
				io.to(membersSockets).emit(NEW_MESSAGE, {
					chatId,
					message: messageForRealTime,
				});
				io.to(membersSockets).emit(NEW_MESSAGE_ALERT, { chatId });

				const messageForDB = {
					content: message,
					senderId: user._id,
					chatId: chatId,
				};

				console.log("New Message", messageForRealTime);
				console.log("Sent to sockets:", membersSockets);

				await db.insert(messageTable).values({
					chatId: messageForDB.chatId,
					senderId: messageForDB.senderId,
					content: messageForDB.content,
				});
			},
		);
	});
}

// Function to get socket IDs for an array of user IDs
export const getSockets = (users: string[]) => {
	const sockets = users
		.map((user) => userSocketIDs.get(user.toString()))
		.filter(Boolean);
	return sockets as string[];
};

// Additional helper functions
export function getSocketId(userId: string): string | undefined {
	return userSocketIDs.get(userId);
}

export function getAllOnlineUsers(): string[] {
	return Array.from(userSocketIDs.keys());
}

export function isUserOnline(userId: string): boolean {
	return userSocketIDs.has(userId);
}
