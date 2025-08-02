import { UsersSelectSchema } from "@/db/models/users.model";
import { z } from "@hono/zod-openapi";

export const profileResponseValidation = UsersSelectSchema.extend({
	message: z.string(),
});
