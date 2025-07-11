import {
	createTaskSchema,
	patchSchema,
	selectTasksSchema,
} from "@/db/schemas/task.schema";
import { notFoundSchema } from "@/lib/constants";
import { createRoute, z } from "@hono/zod-openapi";
import * as HTTPStatusCode from "stoker/http-status-codes";
import {
	jsonContent,
	jsonContentOneOf,
	jsonContentRequired,
} from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

export const list = createRoute({
	tags: ["Get All Tasks"],
	path: "/tasks",
	method: "get",
	responses: {
		[HTTPStatusCode.OK]: jsonContent(
			z.array(selectTasksSchema),
			"The list of tasks",
		),
	},
});

export const create = createRoute({
	tags: ["createTask"],
	path: "/tasks",
	method: "post",
	request: {
		body: jsonContentRequired(createTaskSchema, "The task to create"),
	},
	responses: {
		[HTTPStatusCode.CREATED]: jsonContent(
			selectTasksSchema,
			"The created task",
		),
	},
});

export const getOne = createRoute({
	tags: ["GetData"],
	path: "/tasks/{id}",
	method: "get",
	request: {
		params: z.object({
			id: z.string().uuid(),
		}),
	},
	responses: {
		[HTTPStatusCode.OK]: jsonContent(selectTasksSchema, "The requested Task "),
		[HTTPStatusCode.NOT_FOUND]: jsonContent(notFoundSchema, "Task not found"),
	},
});

export const patch = createRoute({
	tags: ["PatchData"],
	path: "/tasks/{id}",
	method: "patch",
	request: {
		params: z.object({
			id: z.string().uuid(),
		}),
		body: jsonContentRequired(patchSchema, "This is for updating the tasks"),
	},

	responses: {
		[HTTPStatusCode.OK]: jsonContent(selectTasksSchema, "The requested Task "),
		[HTTPStatusCode.NOT_FOUND]: jsonContent(notFoundSchema, "Task not found"),
		[HTTPStatusCode.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
			[
				createErrorSchema(patchSchema),
				createErrorSchema(z.object({ id: z.string().uuid() })),
			],
			"Validation error",
		),
	},
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
