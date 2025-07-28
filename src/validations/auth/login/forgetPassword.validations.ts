import { UsersSelectSchema } from "@/db/models/users.model";
import { z } from "@hono/zod-openapi";
import { isStrongPassword } from "validator";

export const forgetPasswordRequestBody = z.object({
	email: z.string().email().max(254),
});

export const forgetPasswordRequestResponse = z.object({
	status: z.boolean(),
	message: z.string(),
	email: z.string().email(),
	otpDuration: z.number(),
	requestToken: z.string().uuid(),
});

export const verifyChangePasswordRequestBody = z.object({
	email: z.string().email(),
	otp: z.coerce.number().max(9999),
	requestToken: z.string().uuid(),
});

export const verifyChangePasswordResponse = z.object({
	status: z.boolean(),
	message: z.string(),
	email: z.string().email(),
	verificationRequestToken: z.string().uuid(),
});

export const changeUserPasswordRequestBody = z.object({
	email: z.string(),
	newPassword: z
		.string()
		.max(64)
		.refine(
			(input) =>
				isStrongPassword(input, {
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
