import {
	boolean,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users.model";

export const chatsTable = pgTable("chats", {
	id: uuid().primaryKey().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	creatorId: uuid()
		.notNull()
		.references(() => usersTable.id),
	groupChat: boolean()
		.$default(() => false)
		.notNull(),
	createdAt: timestamp().defaultNow(),
});

export const chatMembersTable = pgTable("chat_members", {
	chatId: uuid()
		.notNull()
		.references(() => chatsTable.id),
	userId: uuid()
		.notNull()
		.references(() => usersTable.id),
	joinedAt: timestamp().defaultNow(),
});
