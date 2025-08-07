import { ALERT } from "@/constants/events";
import { db } from "@/db";
import { chatMembersTable, chatsTable } from "@/db/models/chats.model";
import { usersTable } from "@/db/models/users.model";
import { HTTPStatusCode } from "@/lib/constants";
import type { AuthenticatedAppRouteHandler } from "@/lib/types";
import type { RemoveGroupMembers } from "@/routes/chats/group-chats.route";
import { emitEvent } from "@/utils/socket-io";
import { and, eq, inArray } from "drizzle-orm";

export const removeGroupMembers: AuthenticatedAppRouteHandler<
	RemoveGroupMembers
> = async (c) => {
	const { chatId, membersID } = c.req.valid("json");

	// Check if chat exists and is a group chat
	const [chat] = await db
		.select()
		.from(chatsTable)
		.where(and(eq(chatsTable.id, chatId), eq(chatsTable.groupChat, true)));

	if (!chat) {
		return c.json(
			{ message: "No group chat found with this id" },
			HTTPStatusCode.NOT_FOUND,
		);
	}

	// Validate all members exist
	const existingUsers = await db
		.select({ id: usersTable.id })
		.from(usersTable)
		.where(inArray(usersTable.id, membersID));

	if (existingUsers.length !== membersID.length) {
		return c.json(
			{ message: "One or more members are not registered users" },
			HTTPStatusCode.NOT_FOUND,
		);
	}

	// Find members that are actually in the chat
	const existingMembers = await db
		.select({ userId: chatMembersTable.userId })
		.from(chatMembersTable)
		.where(
			and(
				eq(chatMembersTable.chatId, chatId),
				inArray(chatMembersTable.userId, membersID),
			),
		);

	const memberIdsInChat = new Set(existingMembers.map((m) => m.userId));
	const membersToRemove = membersID.filter((id) => memberIdsInChat.has(id));

	if (membersToRemove.length === 0) {
		return c.json(
			{ message: "None of the provided members are in the group" },
			HTTPStatusCode.NOT_FOUND,
		);
	}

	// Remove members from chat
	await db
		.delete(chatMembersTable)
		.where(
			and(
				eq(chatMembersTable.chatId, chatId),
				inArray(chatMembersTable.userId, membersToRemove),
			),
		);

	emitEvent(
		c,
		ALERT,
		membersToRemove,
		`You have been removed from ${chat.name}`,
	);

	return c.json({ removedMembers: membersToRemove }, HTTPStatusCode.OK);
};
