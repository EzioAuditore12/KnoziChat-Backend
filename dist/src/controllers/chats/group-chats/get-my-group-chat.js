import { db } from "../../../db/index.js";
import { chatMembersTable, chatsTable } from "../../../db/models/chats.model.js";
import { usersTable } from "../../../db/models/users.model.js";
import { HTTPStatusCode } from "../../../lib/constants.js";
import { and, eq, inArray } from "drizzle-orm";
export const getMyGroupChats = async (c) => {
    const userId = c.get("userId");
    const { limit, page } = c.req.valid("query");
    const offset = (page - 1) * limit;
    // Get total count for pagination
    const totalChatsResult = await db
        .select()
        .from(chatsTable)
        .innerJoin(chatMembersTable, eq(chatsTable.id, chatMembersTable.chatId))
        .where(and(eq(chatMembersTable.userId, userId), eq(chatsTable.groupChat, true)));
    const totalChats = totalChatsResult.length;
    // Get paginated group chats where the user is a member
    const chatRows = await db
        .select()
        .from(chatsTable)
        .innerJoin(chatMembersTable, eq(chatsTable.id, chatMembersTable.chatId))
        .where(and(eq(chatMembersTable.userId, userId), eq(chatsTable.groupChat, true)))
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
    const membersByChat = {};
    for (const member of memberRows) {
        if (!membersByChat[member.chatId])
            membersByChat[member.chatId] = [];
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
    return c.json({
        status: true,
        message: "Group chats retrieved successfully",
        chats: result,
        total: totalChats,
    }, HTTPStatusCode.OK);
};
