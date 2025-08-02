import {
	HTTPStatusCode,
	conflictRequestSchema,
	notAcceptedRequestSchema,
	notFoundSchema,
	unauthorizedRequestSchema,
} from "@/lib/constants";
import { rateLimiter } from "@/middlewares/rate-limiter";
import {
	changeUserPasswordRequestBody,
	changeUserPasswordResponse,
	forgetPasswordRequestBody,
	forgetPasswordRequestResponse,
	verifyChangePasswordRequestBody,
	verifyChangePasswordResponse,
} from "@/validations/auth/login/forgetPassword.validations";
import {
	loginUserRequestBodySchema,
	loginUserResponseSchema,
} from "@/validations/auth/login/loginUser.validation";
import { createRoute, z } from "@hono/zod-openapi";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { isStrongPassword } from "validator";
import { verifyChangeUserPasswordRequest } from "./handlers/forgetPassword";

export const loginUser = createRoute({
	tags: ["Authentication"],
	path: "/login",
	method: "post",
	request: {
		body: jsonContentRequired(
			loginUserRequestBodySchema,
			"Fields required for login of user",
		),
	},
	middleware: [rateLimiter({ limit: 5, windowTime: 15 * 60 })],
	responses: {
		[HTTPStatusCode.OK]: jsonContent(
			loginUserResponseSchema,
			"User is logged in successfully",
		),
		[HTTPStatusCode.NOT_FOUND]: jsonContent(
			notFoundSchema,
			"The user is not registered",
		),
		[HTTPStatusCode.UNAUTHORIZED]: jsonContent(
			unauthorizedRequestSchema,
			"either provided email or password wrong",
		),
	},
});

export const forgetPasswordTrigger = createRoute({
	tags: ["Authentication"],
	method: "post",
	path: "/forget-password-trigger",
	request: {
		body: jsonContentRequired(
			forgetPasswordRequestBody,
			"Forgotten password request",
		),
	},
	responses: {
		[HTTPStatusCode.ACCEPTED]: jsonContent(
			forgetPasswordRequestResponse,
			"Reset password otp sent",
		),
		[HTTPStatusCode.NOT_FOUND]: jsonContent(
			notFoundSchema,
			"Given user not found",
		),
	},
});

export const verifychangeUserPasswordRequest = createRoute({
	tags: ["Authentication"],
	path: "/verify-change-password-request",
	method: "post",
	request: {
		body: jsonContentRequired(
			verifyChangePasswordRequestBody,
			"Password request verification",
		),
	},
	responses: {
		[HTTPStatusCode.ACCEPTED]: jsonContent(
			verifyChangePasswordResponse,
			"Verfied given otp request",
		),
		[HTTPStatusCode.NOT_FOUND]: jsonContent(
			notFoundSchema,
			"Given user does not exist",
		),
		[HTTPStatusCode.NOT_ACCEPTABLE]: jsonContent(
			notAcceptedRequestSchema,
			"Given otp is incorrect or no such request made",
		),
	},
});

export const changeUserPasswordWithLogin = createRoute({
	tags: ["Authentication"],
	method: "post",
	path: "/change-user-password",
	request: {
		body: jsonContentRequired(
			changeUserPasswordRequestBody,
			"Reset the Password of user",
		),
	},
	responses: {
		[HTTPStatusCode.OK]: jsonContent(
			changeUserPasswordResponse,
			"Password changed successfully and user will be redirect to login",
		),
		[HTTPStatusCode.UNAUTHORIZED]: jsonContent(
			unauthorizedRequestSchema,
			"User is not authorized to do so",
		),
		[HTTPStatusCode.CONFLICT]: jsonContent(
			conflictRequestSchema,
			"User entered same password again",
		),
	},
});

export type LoginUser = typeof loginUser;
export type ForgotPasswordTrigger = typeof forgetPasswordTrigger;
export type VerifyChangeUserPassword = typeof verifychangeUserPasswordRequest;
export type ChangeUserPasswordWithLogin = typeof changeUserPasswordWithLogin;
