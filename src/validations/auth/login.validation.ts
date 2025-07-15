import { UsersInsertSchema, UsersSelectSchema } from "@/db/models/users.model";
import { z } from "@hono/zod-openapi";

export const loginUserBodyValidation = UsersInsertSchema.extend({
	email: z.string().email(),
	password: z.string().max(64),
})
	.omit({ firstName: true, lastName: true, profilePicture: true })
	.strict();

export const loginUserResponseValidation = UsersSelectSchema.extend({
	accessToken: z.string()
});
