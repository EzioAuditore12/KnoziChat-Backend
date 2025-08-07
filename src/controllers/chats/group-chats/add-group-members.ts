import { ALERT } from "@/constants/events";
import { db } from "@/db";
import { chatMembersTable, chatsTable } from "@/db/models/chats.model";
import { usersTable } from "@/db/models/users.model";
import { HTTPStatusCode } from "@/lib/constants";
import type { AuthenticatedAppRouteHandler } from "@/lib/types";
import type { AddGroupMembers } from "@/routes/chats/group-chats.route";
import { emitEvent } from "@/utils/socket-io";
import { and, eq, inArray } from "drizzle-orm";

export const addGroupMembers: AuthenticatedAppRouteHandler<
	AddGroupMembers
> = async (c) => {
	const userId = c.get("userId");
	const { chatId, members } = c.req.valid("json");

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

	// Validate all new members exist
	const existingUsers = await db
		.select({ id: usersTable.id })
		.from(usersTable)
		.where(inArray(usersTable.id, members));

	if (existingUsers.length !== members.length) {
		return c.json(
			{ message: "One or more members are not registered users" },
			HTTPStatusCode.BAD_REQUEST,
		);
	}

	// Find already existing members in the chat
	const existingMembers = await db
		.select({ userId: chatMembersTable.userId })
		.from(chatMembersTable)
		.where(
			and(
				eq(chatMembersTable.chatId, chatId),
				inArray(chatMembersTable.userId, members),
			),
		);

	const alreadyMemberIds = new Set(existingMembers.map((m) => m.userId));
	const newMembersToAdd = members.filter((id) => !alreadyMemberIds.has(id));

	if (newMembersToAdd.length === 0) {
		return c.json(
			{ message: "All provided members are already in the group" },
			HTTPStatusCode.BAD_REQUEST,
		);
	}

	// Add new members
	await db
		.insert(chatMembersTable)
		.values(newMembersToAdd.map((userId) => ({ chatId, userId })));

	emitEvent(
		c,
		ALERT,
		newMembersToAdd,
		`All Users have been added to ${chat.name}`,
	);

	return c.json(
		{ message: "Members added successfully", addedMembers: newMembersToAdd },
		HTTPStatusCode.CREATED,
	);
};
