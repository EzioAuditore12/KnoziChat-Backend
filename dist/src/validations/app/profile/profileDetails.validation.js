import { UsersSelectSchema } from "../../../db/models/users.model.js";
import { z } from "@hono/zod-openapi";
export const profileResponseValidation = UsersSelectSchema.extend({
    message: z.string(),
});
