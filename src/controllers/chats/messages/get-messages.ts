import { db } from "@/db";
import { chatMembersTable, chatsTable } from "@/db/models/chats.model";
import { messageTable } from "@/db/models/messages.model";
import { usersTable } from "@/db/models/users.model";
import { HTTPStatusCode } from "@/lib/constants";
import type { AuthenticatedAppRouteHandler } from "@/lib/types";
import type { GetMessages } from "@/routes/chats/messages.routes";
import { and, asc, eq } from "drizzle-orm";

export const getMessages: AuthenticatedAppRouteHandler<GetMessages> = async (
	c,
) => {
	const userId = c.get("userId");
	const { id: chatId } = c.req.valid("param");
	const { page, limit } = c.req.valid("query");
	const offset = (page - 1) * limit;

	// Check if chat exists
	const [chat] = await db
		.select()
		.from(chatsTable)
		.where(eq(chatsTable.id, chatId));

	if (!chat) {
		return c.json(
			{
				status: false,
				message: "Chat not found",
			},
			HTTPStatusCode.NOT_FOUND,
		);
	}

	// Check if user is a member of the chat
	const [membership] = await db
		.select()
		.from(chatMembersTable)
		.where(
			and(
				eq(chatMembersTable.chatId, chatId),
				eq(chatMembersTable.userId, userId),
			),
		);

	if (!membership) {
		return c.json(
			{
				status: false,
				message: "You are not a member of this chat",
			},
			HTTPStatusCode.UNAUTHORIZED,
		);
	}

	// Get total count for pagination
	const totalMessagesResult = await db
		.select()
		.from(messageTable)
		.where(eq(messageTable.chatId, chatId));
	const total = totalMessagesResult.length;

	// Get messages with sender info (paginated, newest first)
	const messages = await db
		.select({
			id: messageTable.id,
			content: messageTable.content,
			senderId: messageTable.senderId,
			chatId: messageTable.chatId,
			attachments: messageTable.attachements,
			createdAt: messageTable.createdAt,
			senderName: usersTable.firstName,
			senderProfilePicture: usersTable.profilePicture,
		})
		.from(messageTable)
		.innerJoin(usersTable, eq(messageTable.senderId, usersTable.id))
		.where(eq(messageTable.chatId, chatId))
		.orderBy(asc(messageTable.createdAt))
		.limit(limit)
		.offset(offset);

	// Format the response
	const formattedMessages = messages.map((msg) => ({
		id: msg.id,
		content: msg.content,
		senderId: msg.senderId,
		chatId: msg.chatId,
		createdAt: msg.createdAt?.toISOString() || new Date().toISOString(),
		attachments: msg.attachments as Array<{
			fileId: string;
			fileName: string;
			fileSize: number;
			previewUrl: string;
			viewUrl: string;
			downloadUrl: string;
		}> | null,
		sender: {
			id: msg.senderId,
			name: msg.senderName,
			profilePicture: msg.senderProfilePicture,
		},
	}));

	return c.json(
		{
			status: true,
			message: "Messages retrieved successfully",
			messages: formattedMessages,
			total,
			page,
			limit,
		},
		HTTPStatusCode.OK,
	);
};
