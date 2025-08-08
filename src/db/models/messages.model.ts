import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { chatsTable } from "./chats.model";
import { usersTable } from "./users.model";

export const messageTable = pgTable("message", {
	id: uuid().primaryKey().defaultRandom().primaryKey().notNull(),
	senderId: uuid()
		.notNull()
		.references(() => usersTable.id),
	chatId: uuid()
		.notNull()
		.references(() => chatsTable.id),
	content: text(),
	attachements: jsonb(),
	createdAt: timestamp().defaultNow(),
});
