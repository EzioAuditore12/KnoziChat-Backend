import type { PinoLogger } from "@/middlewares/pino-logger";
import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";

//TODO: For Now added id and accessToken in App Bindings , need to find affective solution in future

export interface AppBindings {
	Variables: {
		logger: PinoLogger;
		userId: string;
		accessToken: string;
	};
}

export type AppOpenAPI = OpenAPIHono<AppBindings>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
	R,
	AppBindings
>;
