import {
	boolean,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { usersTable } from "./users.model";

export const chatsTable = pgTable("chats", {
	id: uuid().primaryKey().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	avatar: text(),
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
	joinedAt: timestamp().defaultNow().notNull(),
});

export const chatsInsertSchema = createInsertSchema(chatsTable).omit({
	id: true,
	createdAt: true,
});

export const chatsSelectSchema = createSelectSchema(chatsTable);

export const chatMembersInsertSchema = createInsertSchema(
	chatMembersTable,
).omit({ joinedAt: true });

export const chatMembersSelectSchema = createSelectSchema(chatMembersTable);
