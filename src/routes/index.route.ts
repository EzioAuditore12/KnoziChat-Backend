import { createRouter } from "@/lib/create-app";
import { createRoute, z } from "@hono/zod-openapi";

const router = createRouter().openapi(
	createRoute({
		method: "get",
		path: "/",
		responses: {
			200: {
				content: {
					"application/json": {
						schema: z
							.object({
								message: z.string().openapi({
									example: "KnoziChat API",
									type: "string",
								}),
							})
							.openapi({
								title: "IndexResponse",
								type: "object",
							}),
					},
				},
				description: "Knozichat API Index",
			},
		},
	}),
	(c) => {
		return c.json({
			message: "Knozichat base API",
		});
	},
);

export default router;
