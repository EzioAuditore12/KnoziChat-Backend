import { db } from "@/db";
import { usersTable } from "@/db/models/users.model";
import { HTTPStatusCode } from "@/lib/constants";
import type { AuthenticatedAppRouteHandler } from "@/lib/types";
import type { GetUserDetails } from "@/routes/user/user.route";
import { eq } from "drizzle-orm";

export const userProfile: AuthenticatedAppRouteHandler<GetUserDetails> = async (
	c,
) => {
	const id = c.get("userId");

	const [user] = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.id, id));

	if (!user)
		return c.json({ message: "User doesn't exist" }, HTTPStatusCode.NOT_FOUND);

	return c.json(
		{
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			phoneNumber: user.phoneNumber,
			profilePicture: user.profilePicture,
			message: "finally send",
		},
		HTTPStatusCode.OK,
	);
};
