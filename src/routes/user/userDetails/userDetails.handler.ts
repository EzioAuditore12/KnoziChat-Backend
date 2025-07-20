import { db } from "@/db";
import { usersTable } from "@/db/models/users.model";
import { HTTPStatusCode } from "@/lib/constants";
import type { AuthenticatedAppRouteHandler } from "@/lib/types";
import { eq } from "drizzle-orm";
import type { GetUserDetails } from "./userDetails.route";

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

	return c.json({
		id: user.id,
		firstName: user.firstName,
		lastName: user.lastName,
		email: user.email,
		profilePicture: user.profilePicture,
		message: "Finally done",
	});
};
