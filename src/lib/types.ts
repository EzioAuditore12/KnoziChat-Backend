import type { PinoLogger } from "@/middlewares/pino-logger";
import type { OpenAPIHono } from "@hono/zod-openapi";

export interface AppBindings {
	Variables: {
		logger: PinoLogger;
	};
}

export type AppOpenAPI = OpenAPIHono<AppBindings>;
