import { db } from "../../../db/index.js";
import { usersTable } from "../../../db/models/users.model.js";
import { HTTPStatusCode } from "../../../lib/constants.js";
import { validatePassword } from "../../../utils/crypto-password.js";
import { generateAuthToken } from "../../../utils/jwt.js";
import { eq } from "drizzle-orm";
export const loginUser = async (c) => {
    const { phoneNumber, password } = c.req.valid("json");
    const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.phoneNumber, phoneNumber));
    if (!user)
        return c.json({ message: "The user with this email is not registered with us" }, HTTPStatusCode.NOT_FOUND);
    const validPassword = await validatePassword(password, user.password);
    if (!validPassword)
        return c.json({ message: "Either entered password or email is wrong" }, HTTPStatusCode.UNAUTHORIZED);
    const tokens = await generateAuthToken(user.id);
    return c.json({
        status: true,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture,
            phoneNumber: user.phoneNumber,
        },
        tokens,
        message: "User logged in successfully",
    });
};
