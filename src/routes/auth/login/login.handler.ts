import { db } from "@/db";
import { usersTable } from "@/db/models/users.model";
import { HTTPStatusCode } from "@/lib/constants";
import type { AppRouteHandler } from "@/lib/types";
import { validatePassword } from "@/utils/crypto-password";
import { generateAuthToken } from "@/utils/jwt";
import { eq } from "drizzle-orm";
import type { LoginUser } from "./login.route";

export const loginUser: AppRouteHandler<LoginUser> = async (c) => {
	const { phoneNumber, password } = c.req.valid("json");

	const [user] = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.phoneNumber, phoneNumber));

	if (!user)
		return c.json(
			{ message: "The user with this email is not registered with us" },
			HTTPStatusCode.NOT_FOUND,
		);

	const validPassword = await validatePassword(password, user.password);

	if (!validPassword)
		return c.json(
			{ message: "Either entered password or email is wrong" },
			HTTPStatusCode.UNAUTHORIZED,
		);

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
