import { ALERT } from "@/constants/events";
import { db } from "@/db";
import { chatMembersTable, chatsTable } from "@/db/models/chats.model";
import { usersTable } from "@/db/models/users.model";
import { HTTPStatusCode } from "@/lib/constants";
import type { AuthenticatedAppRouteHandler } from "@/lib/types";
import type { CreateNewGroupChat } from "@/routes/chats/group-chats.route";
import { emitEvent } from "@/utils/socket-io";
import { inArray } from "drizzle-orm";

export const createNewGroupChat: AuthenticatedAppRouteHandler<
	CreateNewGroupChat
> = async (c) => {
	const creatorId = c.get("userId");

	const { name, groupChat, chatMembers } = c.req.valid("json");

	const membersId = Array.from(new Set([creatorId, ...chatMembers]));

	const existingUsers = await db
		.select({ id: usersTable.id })
		.from(usersTable)
		.where(inArray(usersTable.id, membersId));

	if (existingUsers.length !== membersId.length) {
		return c.json(
			{
				message: "One or more members are not registered with us",
			},
			HTTPStatusCode.BAD_REQUEST,
		);
	}

	const [chat] = await db
		.insert(chatsTable)
		.values({
			name,
			creatorId,
			groupChat,
		})
		.returning({
			avatar: chatsTable.avatar,
			chatId: chatsTable.id,
			createdAt: chatsTable.createdAt,
			creatorId: chatsTable.creatorId,
			chatName: chatsTable.name,
			groupChatStatus: chatsTable.groupChat,
		});

	const registeredMembers = await db
		.insert(chatMembersTable)
		.values(
			membersId.map((userId) => ({
				chatId: chat.chatId,
				userId,
			})),
		)
		.returning({ userId: chatMembersTable.userId });

	emitEvent(c, ALERT, chatMembers, `Welcome to ${name} group`);

	return c.json(
		{
			id: chat.chatId,
			avatar: chat.avatar,
			chatMembers: registeredMembers.map((m) => m.userId),
			createdAt: chat.createdAt,
			creatorId: chat.creatorId,
			name: chat.chatName,
			groupChat: chat.groupChatStatus,
		},
		HTTPStatusCode.CREATED,
	);
};
