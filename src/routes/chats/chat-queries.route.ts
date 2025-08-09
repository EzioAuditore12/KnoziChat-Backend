import { HTTPStatusCode, notFoundSchema } from "@/lib/constants";
import { createRoute, z } from "@hono/zod-openapi";
import { jsonContent } from "stoker/openapi/helpers";
import { IdUUIDParamsSchema } from "stoker/openapi/schemas";

import { chatsSelectSchema } from "@/db/models/chats.model";

const memberSelectSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	avatar: z.string().nullable(),
	phoneNumber:z.string()
});

export const getChatDetails = createRoute({
	tags: ["Chat"],
	method: "get",
	path: "details/{id}",
	request: {
		params: IdUUIDParamsSchema,
	},
	responses: {
		[HTTPStatusCode.OK]: jsonContent(
			z.object({
				success: z.boolean(),
				message: z.string(),
				chat: chatsSelectSchema,
				chatMembers: z.array(memberSelectSchema),
			}),
			"Retreival of chat data successfull",
		),
		[HTTPStatusCode.NOT_FOUND]: jsonContent(
			notFoundSchema,
			"Given Chat Id does not exist",
		),
	},
});

export type GetChatDetails = typeof getChatDetails;

export const ChatQueryRoutes = {
	getChatDetails,
};
