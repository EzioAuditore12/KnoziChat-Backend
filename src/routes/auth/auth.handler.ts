import { HTTPStatusCode } from "@/lib/constants";
import type { AppRouteHandler } from "@/lib/types";
import { comparePasswords, generateHashedPassword } from "@/utils/bcrypt";
import { setCookie } from "hono/cookie";
import type { LoginUser, RegisterUser } from "./auth.routes";

import { db } from "@/db";
import { usersTable } from "@/db/models/users.model";
import { generateAuthToken } from "@/utils/jwt";
import { eq } from "drizzle-orm";

export const registerUser: AppRouteHandler<RegisterUser> = async (c) => {
	const { email, firstName, lastName, password } = c.req.valid("json");

	const [existingUser] = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.email, email));

	if (existingUser)
		return c.json({ message: "User Already Exists" }, HTTPStatusCode.CONFLICT);

	const hashedPassword = await generateHashedPassword(password);

	const [createUser] = await db
		.insert(usersTable)
		.values({
			email: email,
			password: hashedPassword,
			firstName: firstName,
			lastName: lastName,
		})
		.returning();

	const tokens = await generateAuthToken(createUser.id);

	setCookie(c, "knozichat-cookie", tokens.refreshToken, {
		httpOnly: true,
		maxAge: 24 * 60 * 60, // 1 day
		secure: true,
	});

	const {
		password: _password,
		createdAt: _createdAt,
		updatedAt: _updatedAt,
		...createdUser
	} = createUser;

	return c.json(
		{ ...createdUser, accessToken: tokens.accessToken },
		HTTPStatusCode.CREATED,
	);
};

export const loginUser: AppRouteHandler<LoginUser> = async (c) => {
	const { email, password } = c.req.valid("json");

	const [user] = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.email, email));

	if (!user)
		return c.json({ message: "User does not exist" }, HTTPStatusCode.NOT_FOUND);

	const validPassword = comparePasswords(password, user.password);

	if (!validPassword)
		return c.json(
			{ message: "Invalid email or password" },
			HTTPStatusCode.UNAUTHORIZED,
		);

	const tokens = await generateAuthToken(user.id);

	setCookie(c, "knozichat-cookie", tokens.refreshToken, {
		httpOnly: true,
		maxAge: 24 * 60 * 60, // 1 day
		secure: true,
	});

	const {
		password: _password,
		createdAt: _createdAt,
		updatedAt: _updatedAt,
		...loggedInUser
	} = user;

	return c.json(
		{ ...loggedInUser, accessToken: tokens.accessToken },
		HTTPStatusCode.OK,
	);
};
