import { db } from "@/db";
import { chatsTable } from "@/db/models/chats.model";
import { chatMembersTable } from "@/db/models/chats.model";
import { messageTable } from "@/db/models/messages.model";
import { HTTPStatusCode } from "@/lib/constants";
import type { AuthenticatedAppRouteHandler } from "@/lib/types";
import type { DeleteGroupChat } from "@/routes/chats/group-chats.route";
import { and, eq } from "drizzle-orm";

export const deleteGroupChat: AuthenticatedAppRouteHandler<
	DeleteGroupChat
> = async (c) => {
	const userId = c.get("userId");

	const { id: chatId } = c.req.valid("param");

	const [chat] = await db
		.select()
		.from(chatsTable)
		.where(eq(chatsTable.id, chatId));

	if (!chat)
		return c.json(
			{ message: "Given chat Id not found" },
			HTTPStatusCode.NOT_FOUND,
		);

	if (!chat.groupChat)
		return c.json(
			{ message: "Given chat id is not a group chat" },
			HTTPStatusCode.BAD_REQUEST,
		);

	const [member] = await db
		.select()
		.from(chatMembersTable)
		.where(
			and(
				eq(chatMembersTable.chatId, chatId),
				eq(chatMembersTable.userId, userId),
			),
		);

	if (!member) {
		return c.json(
			{ message: "You are not a member of this chat" },
			HTTPStatusCode.BAD_REQUEST,
		);
	}

	if (chat.creatorId !== userId)
		return c.json(
			{ message: "You are not allowed to delete this group" },
			HTTPStatusCode.UNAUTHORIZED,
		);

	// TODO: Here need to add logic for deleting attachments stored in appwrite bucket
	await db.delete(messageTable).where(eq(messageTable.chatId, chatId));

	await db.delete(chatMembersTable).where(eq(chatMembersTable.chatId, chatId));

	await db.delete(chatsTable).where(eq(chatsTable.id, chatId));

	return c.json(
		{
			groupId: chat.id,
			message: "Group chat deleted successfully",
		},
		HTTPStatusCode.OK,
	);
};
