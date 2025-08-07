import {
	HTTPStatusCode,
	notFoundSchema,
	unauthorizedRequestSchema,
} from "@/lib/constants";
import {
	regenerateRefreshTokenRequestBodySchema,
	regenerateRefreshTokenResponse,
} from "@/validations/auth/regenerateTokens.validation";
import { createRoute } from "@hono/zod-openapi";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";

export const RegenerateTokens = createRoute({
	tags: ["Authentication"],
	path: "/regenerate-tokens",
	method: "post",
	request: {
		body: jsonContentRequired(
			regenerateRefreshTokenRequestBodySchema,
			"Body requiring refresh token in order to generate tokens",
		),
	},
	responses: {
		[HTTPStatusCode.CREATED]: jsonContent(
			regenerateRefreshTokenResponse,
			"Token refreshed successfully",
		),
		[HTTPStatusCode.UNAUTHORIZED]: jsonContent(
			unauthorizedRequestSchema,
			"Invalid or missing refresh token",
		),
		[HTTPStatusCode.NOT_FOUND]: jsonContent(
			notFoundSchema,
			"Given user not exists with userid provided in refresh token",
		),
	},
});

export type RegenerateTokens = typeof RegenerateTokens;
