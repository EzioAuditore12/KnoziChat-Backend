import { UsersInsertSchema, UsersSelectSchema } from "@/db/models/users.model";
import { z } from "@hono/zod-openapi";

export const loginUserRequestBodySchema = UsersInsertSchema.pick({
	email: true,
	password: true,
})
	.extend({
		email: z.string().email().max(254),
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

export const forgetPasswordRequestBody = z
	.object({
		email: z.string().email(),
	})
	.strict();
