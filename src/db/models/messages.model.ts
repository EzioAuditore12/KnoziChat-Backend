import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { chatsTable } from "./chats.model";
import { usersTable } from "./users.model";

export const messageTable = pgTable("message", {
	id: uuid().primaryKey().defaultRandom().primaryKey().notNull(),
	sender: uuid()
		.notNull()
		.references(() => usersTable.id),
	chat: uuid()
		.notNull()
		.references(() => chatsTable.id),
	content: text().notNull(),
	attachements: text(),
	createdAt: timestamp().defaultNow(),
});
