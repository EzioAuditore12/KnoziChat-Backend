import type { AppRouteHandler } from "@/lib/types";
import type { ListRoute } from "@/routes/tasks/tasks.routes";

import { db } from "@/db";
import { taskSchema } from "@/db/schemas/task.schema";


export const list: AppRouteHandler<ListRoute> = async (c) => {
    const tasks = await db.select().from(taskSchema); // Use the table name as a string
    return c.json(tasks);
};
