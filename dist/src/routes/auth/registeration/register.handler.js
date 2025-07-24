import { db } from "@/db";
import { usersTable } from "@/db/models/users.model";
import { HTTPStatusCode } from "@/lib/constants";
import { generateHashedPassword } from "@/utils/crypto-password";
import { generateAuthToken } from "@/utils/jwt";
import { eq } from "drizzle-orm";
//TODO: Need to add options for fallback of user profile photo, for now assuming it to be null
export const registerUser = async (c) => {
    const { firstName, lastName, email, password } = c.req.valid("json");
    const [existingUser] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email));
    if (existingUser)
        return c.json({ message: "User with this email already exists" }, HTTPStatusCode.CONFLICT);
    const hashedPassword = await generateHashedPassword(password);
    const [createdUser] = await db
        .insert(usersTable)
        .values({
        email,
        firstName,
        lastName,
        password: hashedPassword,
    })
        .returning({
        id: usersTable.id,
        email: usersTable.email,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        profilePicture: usersTable.profilePicture,
    });
    const tokens = await generateAuthToken(createdUser.id);
    return c.json({
        success: true,
        tokens: tokens,
        user: createdUser,
        message: "USer created successfully",
    }, HTTPStatusCode.CREATED);
};
