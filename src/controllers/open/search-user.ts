import { db } from "@/db";
import { usersTable } from "@/db/models/users.model";
import { HTTPStatusCode } from "@/lib/constants";
import type { AppRouteHandler } from "@/lib/types";
import type { SearchUser } from "@/routes/open/search-user.route";
import { ilike } from "drizzle-orm";

export const searchUser: AppRouteHandler<SearchUser> = async (c) => {
	const { name, page, limit } = c.req.valid("query");
	const offset = (page - 1) * limit;

	const users = await db
		.select()
		.from(usersTable)
		.where(ilike(usersTable.firstName, `%${name}%`))
		.limit(limit)
		.offset(offset);

	return c.json({ users }, HTTPStatusCode.OK);
};
