import type { AuthMiddlewareBindings } from "@/middlewares/auth-middleware";
import type { PinoLogger } from "@/middlewares/pino-logger";
import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";

export interface AppBindings {
	Variables: {
		logger: PinoLogger;
	};
}

//TODO: For Now added id and accessToken in App Bindings , need to find affective solution in future

export interface AuthenticatedAppBindings {
	Variables: AppBindings["Variables"] & AuthMiddlewareBindings;
}

export type AppOpenAPI = OpenAPIHono<AppBindings>;
export type AppAuthenticatedOpenApi = OpenAPIHono<AuthenticatedAppBindings>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
	R,
	AppBindings
>;

export type AuthenticatedAppRouteHandler<R extends RouteConfig> = RouteHandler<
	R,
	AuthenticatedAppBindings
>;
