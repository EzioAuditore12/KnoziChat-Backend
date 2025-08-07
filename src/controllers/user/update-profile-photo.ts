import { db } from "@/db";
import { usersTable } from "@/db/models/users.model";
import { HTTPStatusCode } from "@/lib/constants";
import type { AuthenticatedAppRouteHandler } from "@/lib/types";
import type { UploadedFile } from "@/middlewares/hono-multer";
import type { UpdateUserProfilePhoto } from "@/routes/user/user.route";
import { eq } from "drizzle-orm";

export const updateUserProfilePhoto: AuthenticatedAppRouteHandler<
	UpdateUserProfilePhoto
> = async (c) => {
	const userId = c.get("userId");

	// Get uploaded files and fields from the custom middleware
	const uploadedFiles = c.get("uploadedFiles") as Record<string, UploadedFile>;
	const uploadedFields = c.get("uploadedFields") as Record<string, string>;

	const file = uploadedFiles?.photo;
	const name = uploadedFields?.name;

	console.log("Uploaded file:", file);
	console.log("Name field:", name);

	// Use Appwrite URL if available, otherwise use local path
	const profilePictureUrl = file.appwrite?.viewUrl || file.path;
	const previewUrl =
		file.appwrite?.previewUrl || `http://localhost:8000/${file.path}`;

	console.log("Profile picture URL:", profilePictureUrl);

	// Update user's profile picture in database
	await db
		.update(usersTable)
		.set({ profilePicture: profilePictureUrl })
		.where(eq(usersTable.id, userId));

	return c.json(
		{
			status: true,
			profileUrl: previewUrl,
			viewUrl: profilePictureUrl,
			downloadUrl: file.appwrite?.downloadUrl,
			message: "Profile photo updated successfully",
		},
		HTTPStatusCode.ACCEPTED,
	);
};
