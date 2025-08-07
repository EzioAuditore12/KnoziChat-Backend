import { HTTPStatusCode } from "@/lib/constants";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { retreiveChatResponse } from "@/validations/app/chats/group-chats";
import { createRoute } from "@hono/zod-openapi";
import { jsonContent } from "stoker/openapi/helpers";

export const retreiveChats = createRoute({
	tags: ["Get All Chats"],
	method: "get",
	path: "/get-my-chats",
	middleware: [authMiddleware],
	responses: {
		[HTTPStatusCode.OK]: jsonContent(
			retreiveChatResponse,
			"Chats Retreived successfully",
		),
	},
});

export type RetreiveChats = typeof retreiveChats;

export const PrivateChatRoutes = {
	retreiveChats,
};
