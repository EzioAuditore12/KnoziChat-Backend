import {
	HTTPStatusCode,
	conflictRequestSchema,
	notFoundSchema,
	unauthorizedRequestSchema,
} from "@/lib/constants";
import { createRoute } from "@hono/zod-openapi";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";

import {
	loginUserBodyValidation,
	loginUserResponseValidation,
} from "@/validations/auth/login.validation";
import {
	registerUserBodyValidation,
	registerUserResponseValidation,
} from "@/validations/auth/register.validation";

export const registerUser = createRoute({
	tags: ["Authentication"],
	path: "/register",
	method: "post",
	request: {
		body: jsonContentRequired(
			registerUserBodyValidation,
			"To get user details",
		),
	},
	responses: {
		[HTTPStatusCode.CREATED]: jsonContent(
			registerUserResponseValidation,
			"User created successfully",
		),
		[HTTPStatusCode.CONFLICT]: jsonContent(
			conflictRequestSchema,
			"User already exists",
		),
	},
});

export const loginUser = createRoute({
	tags: ["Authentication"],
	path: "/login",
	method: "post",
	request: {
		body: jsonContentRequired(loginUserBodyValidation, "To Login User"),
	},
	responses: {
		[HTTPStatusCode.OK]: jsonContent(
			loginUserResponseValidation,
			"User logged successfully",
		),
		[HTTPStatusCode.NOT_FOUND]: jsonContent(
			notFoundSchema,
			"User does not exist",
		),
		[HTTPStatusCode.UNAUTHORIZED]: jsonContent(
			unauthorizedRequestSchema,
			"Invalid email or password",
		),
	},
});

export type RegisterUser = typeof registerUser;
export type LoginUser = typeof loginUser;
