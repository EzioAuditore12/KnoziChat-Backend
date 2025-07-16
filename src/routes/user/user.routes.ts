import {
	HTTPStatusCode,
	forbiddenRequestSchema,
	notFoundSchema,
	unauthorizedRequestSchema,
} from "@/lib/constants";
import {
	type AuthMiddlewareBindings,
	authMiddleware,
} from "@/middlewares/auth-middleware";
import { profileResponseValidation } from "@/validations/app/profile.validation";
import { createRoute } from "@hono/zod-openapi";
import { jsonContent } from "stoker/openapi/helpers";

export const userProfile = createRoute({
	tags: ["Profile"],
	method: "get",
	path: "/profile",
	middleware: authMiddleware,
	responses: {
		[HTTPStatusCode.OK]: jsonContent(
			profileResponseValidation,
			"Get User details",
		),
		[HTTPStatusCode.UNAUTHORIZED]: jsonContent(
			unauthorizedRequestSchema,
			"User is unauthorized",
		),
		[HTTPStatusCode.FORBIDDEN]: jsonContent(
			forbiddenRequestSchema,
			"Token is expired",
		),
		[HTTPStatusCode.NOT_FOUND]: jsonContent(
			notFoundSchema,
			"User is not found",
		),
	},
});

export type UserProfile = typeof userProfile;
