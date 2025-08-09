import { db } from "../../db/index.js";
import { usersTable } from "../../db/models/users.model.js";
import { HTTPStatusCode } from "../../lib/constants.js";
import { eq } from "drizzle-orm";
export const updateUserProfilePhoto = async (c) => {
    const userId = c.get("userId");
    // Get uploaded files and fields from the custom middleware
    const uploadedFiles = c.get("uploadedFiles");
    const uploadedFields = c.get("uploadedFields");
    const file = uploadedFiles?.photo;
    const name = uploadedFields?.name;
    console.log("Uploaded file:", file);
    console.log("Name field:", name);
    // Use Appwrite URL if available, otherwise use local path
    const profilePictureUrl = file.appwrite?.viewUrl || file.path;
    const previewUrl = file.appwrite?.previewUrl || `http://localhost:8000/${file.path}`;
    console.log("Profile picture URL:", profilePictureUrl);
    // Update user's profile picture in database
    await db
        .update(usersTable)
        .set({ profilePicture: profilePictureUrl })
        .where(eq(usersTable.id, userId));
    return c.json({
        status: true,
        profileUrl: previewUrl,
        viewUrl: profilePictureUrl,
        downloadUrl: file.appwrite?.downloadUrl,
        message: "Profile photo updated successfully",
    }, HTTPStatusCode.ACCEPTED);
};
