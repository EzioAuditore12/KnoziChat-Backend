import { db } from "@/db";
import { usersTable } from "@/db/models/users.model";
import { HTTPStatusCode } from "@/lib/constants";
import type { AppRouteHandler } from "@/lib/types";
import { eq, ilike } from "drizzle-orm";
import type { SearchUser } from "./search-user.routes";

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
