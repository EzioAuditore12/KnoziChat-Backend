import {
	HTTPStatusCode,
	conflictRequestSchema,
	unauthorizedRequestSchema,
} from "@/lib/constants";
import { rateLimiter } from "@/middlewares/rate-limiter";
import {
	registerUserFormRequestBodySchema,
	registerUserFormResponse,
	registerUserResponseSchema,
	validateRegisterUserOTPBodyValidation,
} from "@/validations/auth/register.validation";
import { createRoute } from "@hono/zod-openapi";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";

//TODO: In this need to add verify otp

export const registerUserForm = createRoute({
	tags: ["Authentication"],
	path: "/register",
	method: "post",
	request: {
		body: jsonContentRequired(
			registerUserFormRequestBodySchema,
			"Fields required for registeration of user",
		),
	},
	middleware: [rateLimiter({ limit: 5, windowTime: 15 * 60 })],
	responses: {
		[HTTPStatusCode.ACCEPTED]: jsonContent(
			registerUserFormResponse,
			"OTP has been sent successfully",
		),
		[HTTPStatusCode.CONFLICT]: jsonContent(
			conflictRequestSchema,
			"User already exists",
		),
	},
});

export const validateRegisterOTP = createRoute({
	tags: ["Authentication"],
	path: "/verify-otp-register",
	method: "post",
	request: {
		body: jsonContentRequired(
			validateRegisterUserOTPBodyValidation,
			"Body for otp validation",
		),
	},
	responses: {
		[HTTPStatusCode.CREATED]: jsonContent(
			registerUserResponseSchema,
			"User created successfully",
		),
		[HTTPStatusCode.UNAUTHORIZED]: jsonContent(
			unauthorizedRequestSchema,
			"Invalid or expired OTP",
		),
	},
});

export type RegisterUserForm = typeof registerUserForm;
export type ValidateRegisterationOTP = typeof validateRegisterOTP;
