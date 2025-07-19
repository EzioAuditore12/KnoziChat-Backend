import { HTTPStatusCode } from "@/lib/constants";
import type { AppRouteHandler } from "@/lib/types";
import {
	generateHashedPassword,
	validatePassword,
} from "@/utils/crypto-password";
import { setCookie } from "hono/cookie";
import type {
	LoginUser,
	RegenerateRefreshToken,
	RegisterUser,
	VerifyOtp,
} from "./auth.routes";

import { db } from "@/db";
import { blackListedRefreshTokenTable } from "@/db/models/blacklist-refresh.model";
import { usersTable } from "@/db/models/users.model";
import { emailQueue, emailQueueName } from "@/jobs/sendEmail.job";
import { sendEmail } from "@/services/email";
import { generateAuthToken, validateRefreshToken } from "@/utils/jwt";
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

	const validPassword = await validatePassword(password, user.password);

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

export const verifyOtp: AppRouteHandler<VerifyOtp> = async (c) => {
	const { email, otp } = c.req.valid("json");

	const payload = [
		{
			toMail: email,
			subject: "Just testing email",
			body: `<h1>Here is your otp ${otp}</h1>`,
		},
		{
			toMail: email,
			subject: "Just testing email",
			body: `<h1>Here is your otp ${otp}</h1>`,
		},
		{
			toMail: email,
			subject: "Just testing email",
			body: `<h1>Here is your otp ${otp}</h1>`,
		},
		{
			toMail: email,
			subject: "Just testing email",
			body: `<h1>Here is your otp ${otp}</h1>`,
		},
		{
			toMail: email,
			subject: "Just testing email",
			body: `<h1>Here is your otp ${otp}</h1>`,
		},
	];

	await emailQueue.add(emailQueueName, payload);

	//const sendOtp=await sendEmail(payload);

	//if(!sendOtp) return c.json({message:"Something went wrong"},HTTPStatusCode.INTERNAL_SERVER_ERROR)

	return c.json({ message: "Done succesfully" }, HTTPStatusCode.CREATED);
};

/* Refresh Token logic
1. Take refresh token(r0) from cookie
2. Decode refresh Token and check if it is expired
   - If expired then return
   - If not expired then send user id
3. Validate userid with database and check it it exists or not
4. Blacklist old refresh token(r0) and add into blacklisted refresh token table
4. Make new accessToken and refresh Token and add payload signature data userId
5. (optional) Check for expired if they are expired and delete them from database table of blacklisted refresh token table
*/
export const regenerateRefreshToken: AppRouteHandler<
	RegenerateRefreshToken
> = async (c) => {
	const oldRefreshToken = c.req.valid("cookie");

	const oldDecodeRefreshToken = await validateRefreshToken(
		oldRefreshToken["knozichat-cookie"],
	);

	if (!oldDecodeRefreshToken)
		return c.json(
			{ message: "Given refresh token is not valid or Unauthorized" },
			401,
		);

	const userId = oldDecodeRefreshToken.id;

	const [user] = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.id, userId));

	if (!user)
		return c.json(
			{ message: "Given user id does not exist" },
			HTTPStatusCode.NOT_FOUND,
		);

	await db.insert(blackListedRefreshTokenTable).values({
		userId: user.id,
		refresh_token: oldRefreshToken["knozichat-cookie"],
		createdAt: new Date(oldDecodeRefreshToken.iat * 1000),
		expiredAt: new Date(oldDecodeRefreshToken.exp * 1000),
	});

	const { accessToken, refreshToken } = await generateAuthToken(user.id);

	setCookie(c, "knozichat-cookie", refreshToken, {
		httpOnly: true,
		maxAge: 24 * 60 * 60, // 1 day
		secure: true,
	});

	return c.json(
		{ message: "Generation successfull", accessToken: accessToken },
		HTTPStatusCode.OK,
	);
};
