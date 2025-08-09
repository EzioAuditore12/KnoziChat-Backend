import { HTTPStatusCode } from "../lib/constants.js";
import { parseAccessToken } from "../utils/jwt.js";
import { z } from "@hono/zod-openapi";
import { createMiddleware } from "hono/factory";
import validator from "validator";
const AuthroizationHeaderSchema = z.object({
    Authorization: z.string().refine((val) => {
        const [scheme, token] = val.split(" ");
        return scheme === "Bearer" && validator.isJWT(token);
    }, {
        message: "Authorization header must be in format 'Bearer <JWT>' and JWT must be valid",
    }),
});
export const authMiddleware = createMiddleware(async (c, next) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader)
        return c.json({ message: "Authroization Header is needed" }, HTTPStatusCode.UNAUTHORIZED);
    const result = AuthroizationHeaderSchema.safeParse({
        Authorization: authHeader,
    });
    if (!result.success) {
        return c.json({ message: result.error.errors[0].message }, HTTPStatusCode.UNAUTHORIZED);
    }
    const [, token] = authHeader.split(" ");
    const decoded = await parseAccessToken(token);
    if (!decoded) {
        return c.json({ message: "Given token is invalid or expired" }, HTTPStatusCode.FORBIDDEN);
    }
    c.set("accessToken", token);
    c.set("userId", decoded.id);
    await next();
});
