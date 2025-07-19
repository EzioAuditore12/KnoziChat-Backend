import {
	HTTPStatusCode,
	conflictRequestSchema,
	notFoundSchema,
	tooManyRequestSchema,
	unauthorizedRequestSchema,
} from "@/lib/constants";
import { createRoute, z } from "@hono/zod-openapi";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";

import {
	loginUserBodyValidation,
	loginUserResponseValidation,
} from "@/validations/auth/login.validation";

import { rateLimiter } from "@/middlewares/rate-limiter";
import {
	regenerateRefreshTokenRequestValidationSchema,
	regenerateRefreshTokenResponse,
} from "@/validations/auth/regerateRefreshToken.validation";
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
	middleware: rateLimiter({ limit: 5, windowTime: 15 * 60 }),
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
		[HTTPStatusCode.TOO_MANY_REQUESTS]: jsonContent(
			tooManyRequestSchema,
			"Too may requests send",
		),
	},
});

export const verifyOtp = createRoute({
	tags: ["Authentication"],
	path: "/verify-otp",
	method: "post",
	request: {
		body: jsonContentRequired(
			z.object({
				email: z.string().email(),
				otp: z.coerce.number().positive().max(999999),
			}),
			"Verify OTP",
		),
	},
	responses: {
		[HTTPStatusCode.CREATED]: jsonContent(
			z.object({
				message: z.string(),
			}),
			"Send otp successfully",
		),
		[HTTPStatusCode.INTERNAL_SERVER_ERROR]: jsonContent(
			z.object({
				message: z.string(),
			}),
			"Send otp successfully",
		),
	},
});

export const regenerateRefreshToken = createRoute({
	tags: ["Authentication"],
	path: "/refresh",
	method: "post",
	request: {
		cookies: regenerateRefreshTokenRequestValidationSchema,
	},
	responses: {
		[HTTPStatusCode.OK]: jsonContent(
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

export type RegisterUser = typeof registerUser;
export type LoginUser = typeof loginUser;
export type VerifyOtp = typeof verifyOtp;
export type RegenerateRefreshToken = typeof regenerateRefreshToken;
