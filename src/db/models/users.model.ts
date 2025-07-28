import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const usersTable = pgTable("users", {
	id: uuid().primaryKey().defaultRandom().notNull(),
	firstName: varchar({ length: 50 }).notNull(),
	lastName: varchar({ length: 50 }).notNull(),
	email: varchar({ length: 254 }).unique(),
	phoneNumber: varchar({ length: 20 }).unique().notNull(),
	password: text().notNull(),
	profilePicture: text(),
	createdAt: timestamp().defaultNow(),
	updatedAt: timestamp().$onUpdate(() => new Date()),
});

export const UsersInsertSchema = createInsertSchema(usersTable).omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

export const UsersSelectSchema = createSelectSchema(usersTable).pick({
	id: true,
	firstName: true,
	phoneNumber: true,
	lastName: true,
	email: true,
	profilePicture: true,
});
