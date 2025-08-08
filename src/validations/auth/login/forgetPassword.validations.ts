import { UsersSelectSchema } from "@/db/models/users.model";
import { z } from "@hono/zod-openapi";
import validator from "validator";

export const forgetPasswordRequestBody = z.object({
	phoneNumber: z
		.string()
		.max(20)
		.refine(
			(input) => {
				return validator.isMobilePhone(input);
			},
			{ message: "Entered phone number is not valid" },
		),
});

export const forgetPasswordRequestResponse = z.object({
	status: z.boolean(),
	message: z.string(),
	phoneNumber: z.string(),
	otpDuration: z.number(),
	requestToken: z.string().uuid(),
});

export const verifyChangePasswordRequestBody = z.object({
	phoneNumber: z
		.string()
		.max(20)
		.refine(
			(input) => {
				return validator.isMobilePhone(input);
			},
			{ message: "Entered phone number is not valid" },
		),
	otp: z.coerce.number().max(999999),
	requestToken: z.string().uuid(),
});

export const verifyChangePasswordResponse = z.object({
	status: z.boolean(),
	message: z.string(),
	phoneNumber: z.string(),
	verificationRequestToken: z.string().uuid(),
});

export const changeUserPasswordRequestBody = z.object({
	phoneNumber: z
		.string()
		.max(20)
		.refine(
			(input) => {
				return validator.isMobilePhone(input);
			},
			{ message: "Entered phone number is not valid" },
		),
	newPassword: z
		.string()
		.max(64)
		.refine(
			(input) =>
				validator.isStrongPassword(input, {
					minLength: 8,
					minLowercase: 1,
					minNumbers: 1,
					minSymbols: 1,
					minUppercase: 1,
				}),
			{
				message:
					"The password should be at least 8 characters long and include uppercase, lowercase, number, and symbol.",
			},
		),
	verificationRequestToken: z.string().uuid(),
});

export const changeUserPasswordResponse = z.object({
	status: z.boolean(),
	user: UsersSelectSchema,
	tokens: z.object({
		accessToken: z.string(),
		refreshToken: z.string(),
	}),
});
