import { pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./users.model";

export const requestStatusEnum = pgEnum("request_status", [
	"pending",
	"accepted",
	"rejected",
]);

export const requestsTable = pgTable("requests", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	status: requestStatusEnum("status").default("pending").notNull(),
	sender: uuid()
		.notNull()
		.references(() => usersTable.id),
	receiver: uuid()
		.notNull()
		.references(() => usersTable.id),
	createdAt: timestamp().defaultNow(),
});
