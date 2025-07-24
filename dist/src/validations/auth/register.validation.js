import { UsersInsertSchema, UsersSelectSchema } from "@/db/models/users.model";
import { z } from "@hono/zod-openapi";
import { isStrongPassword } from "validator";
export const registerUserRequestBodySchema = UsersInsertSchema.extend({
    email: z.string().email().max(254),
    password: z
        .string()
        .max(64)
        .refine((input) => {
        return isStrongPassword(input, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        });
    }, {
        message: "Password should contain minimum one uppercase, number, symbol and lowercase",
    }),
    profilePicture: z.string().url().optional(),
}).strict();
export const registerUserResponseSchema = z.object({
    success: z.boolean(),
    user: UsersSelectSchema,
    tokens: z.object({
        accessToken: z.string(),
        refreshToken: z.string(),
    }),
    message: z.string(),
});
