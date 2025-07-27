import {
	HTTPStatusCode,
	conflictRequestSchema,
	unauthorizedRequestSchema,
} from "@/lib/constants";
import { honoMulter } from "@/middlewares/hono-multer";
import { rateLimiter } from "@/middlewares/rate-limiter";
import {
	registerUserFormRequestBodySchema,
	registerUserFormResponse,
	registerUserResponseSchema,
	validateRegisterUserOTPBodyValidation,
} from "@/validations/auth/register.validation";
import { createRoute } from "@hono/zod-openapi";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";

//TODO: Need to change middleware of profilePicture to run after no error is detected

export const registerUserForm = createRoute({
	tags: ["Authentication"],
	path: "/register",
	method: "post",
	middleware: [
		rateLimiter({ limit: 5, windowTime: 15 * 60 }),
		honoMulter({
			fieldNames: ["profilePicture"],
			allowedTypes: ["image/png", "image/jpeg"],
			maxSize: 10 * 1024 * 1024,
			uploadToAppwrite: true,
		}),
	],
	request: {
		body: {
			content: {
				"multipart/form-data": {
					schema: registerUserFormRequestBodySchema,
					description: "Registeration Schema",
				},
			},
		},
	},
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
