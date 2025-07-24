import { HTTPStatusCode, conflictRequestSchema } from "@/lib/constants";
import { rateLimiter } from "@/middlewares/rate-limiter";
import { registerUserRequestBodySchema, registerUserResponseSchema, } from "@/validations/auth/register.validation";
import { createRoute } from "@hono/zod-openapi";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
//TODO: In this need to add verify otp
export const registerUser = createRoute({
    tags: ["Authentication"],
    path: "/register",
    method: "post",
    request: {
        body: jsonContentRequired(registerUserRequestBodySchema, "Fields required for registeration of user"),
    },
    middleware: [rateLimiter({ limit: 5, windowTime: 15 * 60 })],
    responses: {
        [HTTPStatusCode.CREATED]: jsonContent(registerUserResponseSchema, "Registeration is successfull and details of the created users are sent"),
        [HTTPStatusCode.CONFLICT]: jsonContent(conflictRequestSchema, "User already exists"),
    },
});
