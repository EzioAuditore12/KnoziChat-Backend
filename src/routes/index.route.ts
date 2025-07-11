import { createRouter } from "@/lib/create-app";
import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

const router = createRouter().openapi(
	createRoute({
		tags: ["index"],
		method: "get",
		path: "/",
		responses: {
			[HttpStatusCodes.OK]: jsonContent(
				createMessageObjectSchema("KnoziChat"),
				"Knozichat API Index",
			),
		},
	}),
	(c) => {
		return c.json(
			{
				message: "Task API",
			},
			HttpStatusCodes.OK,
		);
	},
);

export default router;
