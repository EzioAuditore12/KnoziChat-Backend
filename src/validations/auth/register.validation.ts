import { UsersInsertSchema, UsersSelectSchema } from "@/db/models/users.model";
import { z } from "@hono/zod-openapi";
import { isStrongPassword } from "validator";

export const registerUserBodyValidation = UsersInsertSchema.extend({
	email: z.string().email(),
	password: z
		.string()
		.max(64)
		.refine(
			(val) =>
				isStrongPassword(val, {
					minLength: 8,
					minLowercase: 1,
					minUppercase: 1,
					minNumbers: 1,
					minSymbols: 1,
				}),
			{
				message:
					"Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.",
			},
		),
	profilePicture: z.string().optional(),
}).strict();

export const registerUserResponseValidation = UsersSelectSchema.extend({
	accessToken: z.string(),
});
