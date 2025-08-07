import { db } from "@/db";
import { chatMembersTable, chatsTable } from "@/db/models/chats.model";
import { usersTable } from "@/db/models/users.model";
import { HTTPStatusCode } from "@/lib/constants";
import type { AuthenticatedAppRouteHandler } from "@/lib/types";
import type { GetMyGroupChats } from "@/routes/chats/group-chats.route";
import { and, eq, inArray } from "drizzle-orm";

export const getMyGroupChats: AuthenticatedAppRouteHandler<
	GetMyGroupChats
> = async (c) => {
	const userId = c.get("userId");

	// Get all group chats where the user is a member
	const chatRows = await db
		.select()
		.from(chatsTable)
		.innerJoin(chatMembersTable, eq(chatsTable.id, chatMembersTable.chatId))
		.where(
			and(eq(chatMembersTable.userId, userId), eq(chatsTable.groupChat, true)),
		);

	const chatIds = chatRows.map((row) => row.chats.id);

	// Get all members for these chats with profile info
	const memberRows = await db
		.select({
			chatId: chatMembersTable.chatId,
			id: usersTable.id,
			name: usersTable.firstName,
			profilePicture: usersTable.profilePicture,
		})
		.from(chatMembersTable)
		.innerJoin(usersTable, eq(chatMembersTable.userId, usersTable.id))
		.where(inArray(chatMembersTable.chatId, chatIds));

	// Group members by chatId
	const membersByChat: Record<
		string,
		Array<{ id: string; name: string; profilePicture: string }>
	> = {};
	for (const member of memberRows) {
		if (!membersByChat[member.chatId]) membersByChat[member.chatId] = [];
		membersByChat[member.chatId].push({
			id: member.id,
			name: member.name,
			profilePicture: member.profilePicture ?? "",
		});
	}

	// Structure the response
	const result = chatRows.map((row) => ({
		id: row.chats.id,
		name: row.chats.name,
		avatar: row.chats.avatar,
		creatorId: row.chats.creatorId,
		groupChat: row.chats.groupChat,
		createdAt: row.chats.createdAt,
		members: membersByChat[row.chats.id] || [],
	}));

	return c.json(
		{
			status: true,
			message: "Group chats retrieved successfully",
			chats: result,
		},
		HTTPStatusCode.OK,
	);
};
