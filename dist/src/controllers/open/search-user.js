import { db } from "../../db/index.js";
import { usersTable } from "../../db/models/users.model.js";
import { HTTPStatusCode } from "../../lib/constants.js";
import { ilike } from "drizzle-orm";
export const searchUser = async (c) => {
    const { name, page, limit } = c.req.valid("query");
    const offset = (page - 1) * limit;
    const users = await db
        .select({
        id: usersTable.id,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        email: usersTable.email,
        phoneNumber: usersTable.phoneNumber,
        profilePicture: usersTable.profilePicture,
    })
        .from(usersTable)
        .where(ilike(usersTable.firstName, `%${name}%`))
        .limit(limit)
        .offset(offset);
    return c.json({ users }, HTTPStatusCode.OK);
};
