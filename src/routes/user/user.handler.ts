import { db } from "@/db";
import { usersTable } from "@/db/models/users.model";
import { HTTPStatusCode } from "@/lib/constants";
import type { AppRouteHandler } from "@/lib/types";
import { validateToken } from "@/utils/jwt";
import { eq } from "drizzle-orm";
import type { UserProfile } from "./user.routes";

export const userProfile: AppRouteHandler<UserProfile> = async (c) => {
	const authHeader = c.req.header("Authorization");

	if (!authHeader)
		return c.json(
			{ message: "Authorization header is not provied" },
			HTTPStatusCode.UNAUTHORIZED,
		);

	const [scheme, token] = authHeader.split(" ");

	if (scheme !== "Bearer" || !token) {
		return c.json(
			{
				message:
					"Haven't Provided valid scheme which is Bearer or haven't given token",
			},
			HTTPStatusCode.FORBIDDEN,
		);
	}

	const decodeToken = await validateToken(token);

	if (!decodeToken)
		return c.json(
			{ message: "Given token is invalid or expired" },
			HTTPStatusCode.FORBIDDEN,
		);

	const { id } = decodeToken;

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
