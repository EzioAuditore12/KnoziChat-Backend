import type { AppRouteHandler } from "@/lib/types";
import type {
	CreateRoute,
	GetOneRoute,
	ListRoute,
	PatchRoute,
} from "@/routes/tasks/tasks.routes";

import { db } from "@/db";
import { taskSchema } from "@/db/schemas/task.schema";
import { eq } from "drizzle-orm";

import * as HTTPStatusCode from "stoker/http-status-codes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
	const tasks = await db.select().from(taskSchema);
	return c.json(tasks);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
	const task = c.req.valid("json");
	const [inserted] = await db.insert(taskSchema).values(task).returning();
	return c.json(inserted);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
	const { id } = c.req.valid("param");
	const [task] = await db
		.select()
		.from(taskSchema)
		.where(eq(taskSchema.id, id));
	if (!task)
		return c.json({ message: "task not found" }, HTTPStatusCode.NOT_FOUND);
	return c.json(task, HTTPStatusCode.OK);
};

export const path: AppRouteHandler<PatchRoute> = async (c) => {
	const { id } = c.req.valid("param");
	const updates = c.req.valid("json");
	const [task] = await db
		.update(taskSchema)
		.set(updates)
		.where(eq(taskSchema.id, id))
		.returning();
	return c.json(task, HTTPStatusCode.OK);
};
