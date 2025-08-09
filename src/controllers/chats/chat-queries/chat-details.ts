import { db } from "@/db";
import { chatsTable } from "@/db/models/chats.model";
import { chatMembersTable } from "@/db/models/chats.model";
import { usersTable } from "@/db/models/users.model";
import { HTTPStatusCode } from "@/lib/constants";
import type { AuthenticatedAppRouteHandler } from "@/lib/types";
import type { GetChatDetails } from "@/routes/chats/chat-queries.route";
import { eq } from "drizzle-orm";

export const getChatDetails: AuthenticatedAppRouteHandler<
	GetChatDetails
> = async (c) => {
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

	const chatMembers = await db
		.select({
			id: usersTable.id,
			name: usersTable.firstName,
			avatar: usersTable.profilePicture,
			phoneNumber:usersTable.phoneNumber
		})
		.from(chatMembersTable)
		.innerJoin(usersTable, eq(chatMembersTable.userId, usersTable.id))
		.where(eq(chatMembersTable.chatId, chatId));

	return c.json(
		{
			success: true,
			message: "Chat data loaded successfully",
			chat,
			chatMembers,
		},
		HTTPStatusCode.OK,
	);
};
