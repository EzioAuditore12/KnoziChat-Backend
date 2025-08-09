import { db } from "../../db/index.js";
import { usersTable } from "../../db/models/users.model.js";
import { HTTPStatusCode } from "../../lib/constants.js";
import { eq } from "drizzle-orm";
export const userProfile = async (c) => {
    const id = c.get("userId");
    const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, id));
    if (!user)
        return c.json({ message: "User doesn't exist" }, HTTPStatusCode.NOT_FOUND);
    return c.json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
        message: "finally send",
    }, HTTPStatusCode.OK);
};
