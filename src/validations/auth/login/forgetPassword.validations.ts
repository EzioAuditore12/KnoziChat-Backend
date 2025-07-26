import { UsersSelectSchema } from "@/db/models/users.model";
import { z } from "@hono/zod-openapi";

export const sendForgotPasswordRequestBody = z.object({
	email: z.string().email().max(254),
});

export const sendForgetPasswordResponse = z.object({
	status: z.boolean(),
	message: z.string(),
});

export const verifyForgetPasswordRequestBody = z.object({
	email: z.boolean(),
	otp: z.coerce.number().max(9999),
});
