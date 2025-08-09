import { HTTPStatusCode, notFoundSchema, unauthorizedRequestSchema, } from "../../lib/constants.js";
import { rateLimiter } from "../../middlewares/rate-limiter.js";
import { loginUserRequestBodySchema, loginUserResponseSchema, } from "../../validations/auth/login/loginUser.validation.js";
import { createRoute } from "@hono/zod-openapi";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
export const loginUser = createRoute({
    tags: ["Authentication"],
    path: "/login",
    method: "post",
    request: {
        body: jsonContentRequired(loginUserRequestBodySchema, "Fields required for login of user"),
    },
    middleware: [rateLimiter({ limit: 5, windowTime: 15 * 60 })],
    responses: {
        [HTTPStatusCode.OK]: jsonContent(loginUserResponseSchema, "User is logged in successfully"),
        [HTTPStatusCode.NOT_FOUND]: jsonContent(notFoundSchema, "The user is not registered"),
        [HTTPStatusCode.UNAUTHORIZED]: jsonContent(unauthorizedRequestSchema, "either provided email or password wrong"),
    },
});
export const LoginUserRoutes = {
    loginUser,
};
