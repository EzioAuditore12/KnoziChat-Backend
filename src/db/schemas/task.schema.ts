import {
	boolean,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { z } from "@hono/zod-openapi";

export const taskSchema = pgTable("tasks", {
	id: uuid().unique().primaryKey().defaultRandom(),
	name: varchar({ length: 10 }).notNull(),
	done: boolean().default(false).notNull(),
	createdAt: timestamp().defaultNow(),
	updatedAt: timestamp().$onUpdate(() => new Date()),
});

export const selectTasksSchema = createSelectSchema(taskSchema);

export const createTaskSchema = createInsertSchema(taskSchema, {
	done: z.coerce.boolean(),
	name: z.string().max(3),
})
	.required({
		done: true,
		name: true,
	})
	.strict()
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
	});

export const patchSchema = createInsertSchema(taskSchema, {
	done: z.coerce.boolean(),
	name: z.string().max(3),
})
	.partial()
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
	});
