import { HTTPStatusCode, notAcceptedRequestSchema } from "@/lib/constants";
import {
	forbiddenRequestSchema,
	notFoundSchema,
	unauthorizedRequestSchema,
} from "@/lib/constants";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { honoMulter } from "@/middlewares/hono-multer";
import { profileResponseValidation } from "@/validations/app/profile/profileDetails.validation";
import {
	updateProfilePhotoResponse,
	updateProfileRequestBody,
} from "@/validations/user/updateProfilePhoto";
import { createRoute } from "@hono/zod-openapi";
import { jsonContent } from "stoker/openapi/helpers";

export const getUserDetails = createRoute({
	tags: ["Profile"],
	path: "/profile",
	method: "get",
	middleware: [authMiddleware],
	responses: {
		[HTTPStatusCode.OK]: jsonContent(
			profileResponseValidation,
			"Get User details",
		),
		[HTTPStatusCode.UNAUTHORIZED]: jsonContent(
			unauthorizedRequestSchema,
			"User is unauthorized",
		),
		[HTTPStatusCode.FORBIDDEN]: jsonContent(
			forbiddenRequestSchema,
			"Token is expired",
		),
		[HTTPStatusCode.NOT_FOUND]: jsonContent(
			notFoundSchema,
			"User is not found",
		),
	},
});

export type GetUserDetails = typeof getUserDetails;

export const updateUserProfilePhoto = createRoute({
	tags: ["Profile"],
	path: "/update-profile-photo",
	method: "post",
	middleware: [
		authMiddleware,
		honoMulter({
			fieldNames: ["photo"],
			allowedTypes: ["image/png"],
			maxSize: 26 * 1024 * 1024, // 5MB
			uploadToAppwrite: true, // Enable Appwrite upload
		}),
	],
	request: {
		body: {
			content: {
				"multipart/form-data": {
					schema: updateProfileRequestBody,
				},
			},
		},
	},
	responses: {
		[HTTPStatusCode.ACCEPTED]: jsonContent(
			updateProfilePhotoResponse,
			"Response after successfull updation of profile photo",
		),
		[HTTPStatusCode.NOT_ACCEPTABLE]: jsonContent(
			notAcceptedRequestSchema,
			"The file is not supported or too large",
		),
	},
});

export type UpdateUserProfilePhoto = typeof updateUserProfilePhoto;
