import { db } from "@/db";
import { chatsTable } from "@/db/models/chats.model";
import { chatMembersTable } from "@/db/models/chats.model";
import { HTTPStatusCode } from "@/lib/constants";
import type { AuthenticatedAppRouteHandler } from "@/lib/types";
import type { RenameGroupName } from "@/routes/chats/group-chats.route";
import { and, eq } from "drizzle-orm";

export const renameGroupName: AuthenticatedAppRouteHandler<
	RenameGroupName
> = async (c) => {
	const editorId = c.get("userId");

	const { id: chatId } = c.req.valid("param");

	const { newName: newGroupName } = c.req.valid("json");

	const [chat] = await db
		.select()
		.from(chatsTable)
		.where(eq(chatsTable.id, chatId));

	if (!chat) {
		return c.json(
			{ message: "Given Chat ID not found" },
			HTTPStatusCode.NOT_FOUND,
		);
	}

	if (chat.groupChat !== true) {
		return c.json(
			{ message: "Given chat is not a group chat" },
			HTTPStatusCode.BAD_REQUEST,
		);
	}

	const [member] = await db
		.select()
		.from(chatMembersTable)
		.where(
			and(
				eq(chatMembersTable.chatId, chatId),
				eq(chatMembersTable.userId, editorId),
			),
		);

	if (!member) {
		return c.json(
			{ message: "User is not a member of this chat" },
			HTTPStatusCode.BAD_REQUEST,
		);
	}

	const [updateGroupName] = await db
		.update(chatsTable)
		.set({ name: newGroupName })
		.where(eq(chatsTable.id, chatId))
		.returning({ name: chatsTable.name });

	return c.json(
		{
			groupId: chat.id,
			message: `Chat Name edited by ${editorId}`,
			newGroupName: updateGroupName.name,
		},
		HTTPStatusCode.OK,
	);
};
