import { z } from "@hono/zod-openapi";
import { isJWT } from "validator";
export const regenerateRefreshTokenRequestBodySchema = z.object({
    oldRefreshToken: z
        .string()
        .refine((val) => isJWT(val), { message: "Given token is not jwt" }),
});
export const regenerateRefreshTokenResponse = z.object({
    status: z.boolean(),
    message: z.string(),
    tokens: z.object({
        refreshToken: z.string(),
        accessToken: z.string(),
    }),
});
