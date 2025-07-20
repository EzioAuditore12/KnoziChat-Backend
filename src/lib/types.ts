import type { AuthMiddlewareBindings } from "@/middlewares/auth-middleware";
import type { PinoLogger } from "@/middlewares/pino-logger";
import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { Schema } from "hono";

export interface AppBindings {
	Variables: {
		logger: PinoLogger;
	};
}

export interface AuthenticatedAppBindings {
	Variables: AppBindings["Variables"] & AuthMiddlewareBindings;
}

export type AppOpenAPI<S extends Schema = {}> = OpenAPIHono<AppBindings, S>;
export type AppAuthenticatedOpenApi<S extends Schema = {}> = OpenAPIHono<
	AuthenticatedAppBindings,
	S
>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
	R,
	AppBindings
>;

export type AuthenticatedAppRouteHandler<R extends RouteConfig> = RouteHandler<
	R,
	AuthenticatedAppBindings
>;
