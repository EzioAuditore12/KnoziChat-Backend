import { UsersSelectSchema } from "@/db/models/users.model";
import { HTTPStatusCode, notFoundSchema } from "@/lib/constants";
import { createRoute, z } from "@hono/zod-openapi";
import { jsonContent } from "stoker/openapi/helpers";

export const searchUserRoute = createRoute({
	tags: ["Open"],
	method: "get",
	path: "/user",
	request: {
		query: z.object({
			name: z.string().max(50),
			page: z.coerce.number().int().min(1).default(1),
			limit: z.coerce.number().int().min(1).max(100).default(10),
		}),
	},
	responses: {
		[HTTPStatusCode.OK]: jsonContent(
			z.object({ users: z.array(UsersSelectSchema) }),
			"Given users details successfully",
		),
		[HTTPStatusCode.NOT_FOUND]: jsonContent(
			notFoundSchema,
			"Given id of user does not exist",
		),
	},
});

export type SearchUser = typeof searchUserRoute;
