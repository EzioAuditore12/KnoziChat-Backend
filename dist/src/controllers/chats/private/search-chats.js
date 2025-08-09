import { db } from "../../../db/index.js";
import { chatMembersTable, chatsTable } from "../../../db/models/chats.model.js";
import { usersTable } from "../../../db/models/users.model.js";
import { HTTPStatusCode } from "../../../lib/constants.js";
import { and, eq, ilike, inArray, or } from "drizzle-orm";
export const searchChats = async (c) => {
    const userId = c.get("userId");
    const { name, page, limit } = c.req.valid("query");
    const offset = (page - 1) * limit;
    // Get all chats where the user is a member first
    const userChats = await db
        .select({ chatId: chatMembersTable.chatId })
        .from(chatMembersTable)
        .where(eq(chatMembersTable.userId, userId));
    const chatIds = userChats.map((chat) => chat.chatId);
    if (chatIds.length === 0) {
        return c.json({
            status: true,
            message: "No chats found",
            chats: [],
            total: 0,
            page,
            limit,
        }, HTTPStatusCode.OK);
    }
    // Search chats by name (for group chats) and get all matching chats
    const matchingChats = await db
        .select()
        .from(chatsTable)
        .where(and(inArray(chatsTable.id, chatIds), or(
    // Search group chat names
    and(eq(chatsTable.groupChat, true), ilike(chatsTable.name, `%${name}%`)), 
    // For private chats, we need to search by member names (handled below)
    eq(chatsTable.groupChat, false))));
    // For private chats, search by other user's name
    const privateChatsWithMembers = await db
        .select({
        chatId: chatMembersTable.chatId,
        chat: chatsTable,
        memberName: usersTable.firstName,
        memberId: usersTable.id,
    })
        .from(chatMembersTable)
        .innerJoin(chatsTable, eq(chatMembersTable.chatId, chatsTable.id))
        .innerJoin(usersTable, eq(chatMembersTable.userId, usersTable.id))
        .where(and(inArray(chatMembersTable.chatId, chatIds), eq(chatsTable.groupChat, false), ilike(usersTable.firstName, `%${name}%`)));
    // Filter private chats to only include ones where the OTHER user matches the query
    const validPrivateChats = privateChatsWithMembers.filter((item) => item.memberId !== userId);
    // Combine group chats and private chats
    const groupChatResults = matchingChats.filter((chat) => chat.groupChat);
    const privateChatResults = validPrivateChats.map((item) => item.chat);
    // Remove duplicates and combine
    const allMatchingChats = [
        ...groupChatResults,
        ...privateChatResults.filter((privateChat) => !groupChatResults.some((groupChat) => groupChat.id === privateChat.id)),
    ];
    const total = allMatchingChats.length;
    // Apply pagination
    const paginatedChats = allMatchingChats.slice(offset, offset + limit);
    const paginatedChatIds = paginatedChats.map((chat) => chat.id);
    // Get all members for the paginated chats
    const memberRows = await db
        .select({
        chatId: chatMembersTable.chatId,
        id: usersTable.id,
        name: usersTable.firstName,
        profilePicture: usersTable.profilePicture,
    })
        .from(chatMembersTable)
        .innerJoin(usersTable, eq(chatMembersTable.userId, usersTable.id))
        .where(inArray(chatMembersTable.chatId, paginatedChatIds));
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
    const result = paginatedChats.map((chat) => {
        const members = membersByChat[chat.id] || [];
        if (!chat.groupChat) {
            // Private chat: Show the OTHER user's info (not current user)
            const otherUser = members.find((member) => member.id !== userId);
            return {
                id: chat.id,
                name: otherUser?.name || "Unknown User",
                avatar: otherUser?.profilePicture || "",
                creatorId: chat.creatorId,
                groupChat: chat.groupChat,
                createdAt: chat.createdAt?.toISOString() || null,
                members,
            };
        }
        // Group chat: Show stored group info
        return {
            id: chat.id,
            name: chat.name || "Group Chat",
            avatar: chat.avatar || "",
            creatorId: chat.creatorId,
            groupChat: chat.groupChat,
            createdAt: chat.createdAt?.toISOString() || null,
            members,
        };
    });
    return c.json({
        status: true,
        message: "Chats searched successfully",
        chats: result,
        total,
        page,
        limit,
    }, HTTPStatusCode.OK);
};
