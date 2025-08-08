import { db } from "@/db";
import { chatMembersTable, chatsTable } from "@/db/models/chats.model";
import { usersTable } from "@/db/models/users.model";
import { HTTPStatusCode } from "@/lib/constants";
import type { AuthenticatedAppRouteHandler } from "@/lib/types";
import type { RetreiveChats } from "@/routes/chats/private-chat.route";
import { eq, inArray } from "drizzle-orm";

export const retreiveChats: AuthenticatedAppRouteHandler<
	RetreiveChats
> = async (c) => {
	const userId = c.get("userId");
	const { limit, page } = c.req.valid("query");
	const offset = (page - 1) * limit;

	// Get total count for pagination
	const totalChatsResult = await db
		.select()
		.from(chatsTable)
		.innerJoin(chatMembersTable, eq(chatsTable.id, chatMembersTable.chatId))
		.where(eq(chatMembersTable.userId, userId));
	const totalChats = totalChatsResult.length;

	// Get paginated chats where the user is a member
	const chatRows = await db
		.select()
		.from(chatsTable)
		.innerJoin(chatMembersTable, eq(chatsTable.id, chatMembersTable.chatId))
		.where(eq(chatMembersTable.userId, userId))
		.limit(limit)
		.offset(offset);

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
	const result = chatRows.map((row) => {
		const chat = row.chats;
		const members = membersByChat[chat.id] || [];

		if (!chat.groupChat) {
			// Private chat: Show the OTHER user's info (not current user)
			const otherUser = members.find((member) => member.id !== userId);

			return {
				id: chat.id,
				name: otherUser?.name || "Unknown User", // Show other user's name
				avatar: otherUser?.profilePicture || "", // Show other user's avatar
				creatorId: chat.creatorId,
				groupChat: chat.groupChat,
				createdAt: chat.createdAt,
				members,
			};
		}

		// Group chat: Show stored group info
		return {
			id: chat.id,
			name: chat.name || "Group Chat", // Group name
			avatar: chat.avatar || "", // Group avatar
			creatorId: chat.creatorId,
			groupChat: chat.groupChat,
			createdAt: chat.createdAt,
			members,
		};
	});

	return c.json(
		{
			status: true,
			message: "Chats retreived successfully",
			chats: result,
			total: totalChats,
		},
		HTTPStatusCode.OK,
	);
};
