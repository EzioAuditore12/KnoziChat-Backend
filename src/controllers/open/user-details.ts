import { db } from "@/db";
import { usersTable } from "@/db/models/users.model";
import { HTTPStatusCode } from "@/lib/constants";
import type { AppRouteHandler } from "@/lib/types";
import type { GetUserDetails } from "@/routes/open/search-user.route";
import { eq } from "drizzle-orm";

export const getUserDetails: AppRouteHandler<GetUserDetails> = async (c) => {
	const { id: userId } = c.req.valid("param");

	const [user] = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.id, userId));

	if (!user)
		return c.json(
			{ message: "Given user is not found" },
			HTTPStatusCode.NOT_FOUND,
		);

	return c.json(
		{
			id: user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			phoneNumber: user.phoneNumber,
			profilePicture: user.profilePicture,
			joinedAt: user.createdAt,
		},
		HTTPStatusCode.OK,
	);
};
