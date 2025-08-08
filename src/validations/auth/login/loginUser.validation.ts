import { UsersInsertSchema, UsersSelectSchema } from "@/db/models/users.model";
import { z } from "@hono/zod-openapi";
import validator from "validator";

export const loginUserRequestBodySchema = UsersInsertSchema.pick({
	phoneNumber: true,
	password: true,
})
	.extend({
		phoneNumber: z
			.string()
			.max(20)
			.refine(
				(input) => {
					return validator.isMobilePhone(input);
				},
				{ message: "Entered phone number is not valid" },
			),
		password: z.string().max(64),
	})
	.strict();

export type loginUserInputs = z.infer<typeof loginUserRequestBodySchema>;

export const loginUserResponseSchema = z.object({
	status: z.boolean(),
	user: UsersSelectSchema,
	tokens: z.object({
		accessToken: z.string(),
		refreshToken: z.string(),
	}),
});
