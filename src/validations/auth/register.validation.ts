import { File } from "node:buffer";
import { UsersInsertSchema, UsersSelectSchema } from "@/db/models/users.model";
import { z } from "@hono/zod-openapi";
import validator from "validator"

//Form
export const registerUserFormRequestBodySchema = UsersInsertSchema.extend({
	password: z
		.string()
		.max(64)
		.refine(
			(input) => {
				return validator.isStrongPassword(input, {
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
	phoneNumber: z.string().refine(
		(input) => {
			return validator.isMobilePhone(input);
		},
		{
			message: "Entered field is not a mobile number",
		},
	),
	profilePicture: z
		.instanceof(File)
		.refine((file) => ["image/png", "image/jpeg"].includes(file.type), {
			message: "Only PNG and JPEG files are allowed",
		}),
})
	.omit({ email: true })
	.strict();

export const registerUserFormResponse = z.object({
	success: z.boolean(),
	phoneNumber: z.string(),
	message: z.string(),
	registerationToken: z.string().uuid(),
	otpDuration: z.number(),
});

export interface RegisterUserInputs
	extends z.infer<typeof registerUserFormRequestBodySchema> {
	otp: string;
	registerationToken: string;
}
//Validate-OTP
export const validateRegisterUserOTPBodyValidation = z
	.object({
		phoneNumber: z.string().refine(
			(input) => {
				return validator.isMobilePhone(input);
			},
			{
				message: "Entered field is not a mobile number",
			},
		),
		otp: z.coerce.number().max(999999).nonnegative(),
		registerationToken: z.string().uuid(),
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
