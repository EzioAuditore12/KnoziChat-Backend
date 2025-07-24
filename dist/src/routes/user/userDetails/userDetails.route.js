import { HTTPStatusCode } from "@/lib/constants";
import { forbiddenRequestSchema, notFoundSchema, unauthorizedRequestSchema, } from "@/lib/constants";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { profileResponseValidation } from "@/validations/app/profile/profileDetails.validation";
import { createRoute } from "@hono/zod-openapi";
import { jsonContent } from "stoker/openapi/helpers";
export const getUserDetails = createRoute({
    tags: ["Profile"],
    path: "/profile",
    method: "get",
    middleware: [authMiddleware],
    responses: {
        [HTTPStatusCode.OK]: jsonContent(profileResponseValidation, "Get User details"),
        [HTTPStatusCode.UNAUTHORIZED]: jsonContent(unauthorizedRequestSchema, "User is unauthorized"),
        [HTTPStatusCode.FORBIDDEN]: jsonContent(forbiddenRequestSchema, "Token is expired"),
        [HTTPStatusCode.NOT_FOUND]: jsonContent(notFoundSchema, "User is not found"),
    },
});
