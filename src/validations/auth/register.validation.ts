import { File } from "node:buffer";
import { UsersInsertSchema, UsersSelectSchema } from "@/db/models/users.model";
import { z } from "@hono/zod-openapi";
import { isStrongPassword } from "validator";

//Form
export const registerUserFormRequestBodySchema = UsersInsertSchema.extend({
	email: z.string().email().max(254),
	password: z
		.string()
		.max(64)
		.refine(
			(input) => {
				return isStrongPassword(input, {
					minLength: 8,
					minLowercase: 1,
					minUppercase: 1,
					minNumbers: 1,
					minSymbols: 1,
				});
			},
			{
				message:
					"Password should contain minimum one uppercase, number, symbol and lowercase",
			},
		),
	profilePicture: z
		.instanceof(File)
		.refine((file) => ["image/png", "image/jpeg"].includes(file.type), {
			message: "Only PNG and JPEG files are allowed",
		}),
}).strict();

export const registerUserFormResponse = z.object({
	success: z.boolean(),
	email: z.string().email(),
	message: z.string(),
	otpDuration: z.number(),
});

export interface RegisterUserInputs
	extends z.infer<typeof registerUserFormRequestBodySchema> {
	otp: string;
}
//Validate-OTP
export const validateRegisterUserOTPBodyValidation = z
	.object({
		email: z.string().email(),
		otp: z.coerce.number().max(999999).nonnegative(),
	})
	.strict();

export const registerUserResponseSchema = z.object({
	success: z.boolean(),
	user: UsersSelectSchema,
	tokens: z.object({
		accessToken: z.string(),
		refreshToken: z.string(),
	}),
	message: z.string(),
});
