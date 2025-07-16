import { z } from "@hono/zod-openapi";
import { isJWT } from "validator";

export const regenerateRefreshTokenRequestValidationSchema = z.object({
	"knozichat-cookie": z
		.string()
		.refine((val) => isJWT(val), { message: "Given token is not jwt" }),
});

export const regenerateRefreshTokenResponse = z.object({
	message: z.string(),
	accessToken: z.string(),
});
