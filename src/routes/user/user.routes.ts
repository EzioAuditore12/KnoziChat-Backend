import {
	HTTPStatusCode,
	forbiddenRequestSchema,
	notFoundSchema,
	unauthorizedRequestSchema,
} from "@/lib/constants";
import { profileResponseValidation } from "@/validations/app/profile.validation";
import { createRoute, z } from "@hono/zod-openapi";
import { jsonContent } from "stoker/openapi/helpers";
import { isJWT } from "validator";

export const userProfile = createRoute({
	tags: ["Profile"],
	method: "get",
	path: "/profile",
	request: {
		headers: z.object({
			Authorization: z.string().refine(
				(val) => {
					const [scheme, token] = val.split(" ");
					return scheme === "Bearer" && isJWT(token);
				},
				{
					message:
						"Authorization header must be in format 'Bearer <JWT>' and JWT must be valid",
				},
			),
		}),
	},
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
