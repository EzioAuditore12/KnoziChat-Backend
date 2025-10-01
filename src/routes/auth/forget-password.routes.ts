import {
	HTTPStatusCode,
	conflictRequestSchema,
	notAcceptedRequestSchema,
	notFoundSchema,
	unauthorizedRequestSchema,
} from "@/lib/constants";
import {
	changeUserPasswordRequestBody,
	changeUserPasswordResponse,
	forgetPasswordRequestBody,
	forgetPasswordRequestResponse,
	verifyChangePasswordRequestBody,
	verifyChangePasswordResponse,
} from "@/validations/auth/login/forgetPassword.validations";

import { createRoute } from "@hono/zod-openapi";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";

export const forgetPasswordTrigger = createRoute({
	tags: ["Authentication"],
	method: "post",
	path: "/forget-password-trigger",
	summary: "Trigger Forget Password Request",
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
	summary: "Verify Change Password Request",
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
	summary: "Change User Password Request",
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

export type ForgotPasswordTrigger = typeof forgetPasswordTrigger;
export type VerifyChangeUserPassword = typeof verifychangeUserPasswordRequest;
export type ChangeUserPasswordWithLogin = typeof changeUserPasswordWithLogin;

export const ForgotPasswordRoutes = {
	forgetPasswordTrigger,
	verifychangeUserPasswordRequest,
	changeUserPasswordWithLogin,
};
