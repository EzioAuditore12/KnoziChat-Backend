import { randomUUID } from "node:crypto";
import { db } from "@/db";
import { usersTable } from "@/db/models/users.model";
import { addEmailJob } from "@/jobs/sendEmail";
import { HTTPStatusCode } from "@/lib/constants";
import { redisClient } from "@/lib/redis-client";
import type { AppRouteHandler } from "@/lib/types";
import {
	generateHashedPassword,
	validatePassword,
} from "@/utils/crypto-password";
import { generateAuthToken } from "@/utils/jwt";
import { eq } from "drizzle-orm";
import type {
	ChangeUserPasswordWithLogin,
	ForgotPasswordTrigger,
	VerifyChangeUserPassword,
} from "../login.route";

export const forgotPasswordTrigger: AppRouteHandler<
	ForgotPasswordTrigger
> = async (c) => {
	const { email } = c.req.valid("json");

	const [user] = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.email, email));

	if (!user)
		return c.json(
			{ message: "Given user not found" },
			HTTPStatusCode.NOT_FOUND,
		);

	const otp = Math.floor(100000 + Math.random() * 900000).toString();
	const period = 600;

	const requestToken = randomUUID();

	await redisClient.setex(
		`otp:forgot-password:${email}`,
		period,
		JSON.stringify({
			otp,
			email,
			requestToken,
		}),
	);

	await addEmailJob({
		toMail: email,
		subject: "Otp for changing password",
		body: `<h1>Your OTP is: ${otp}</h1><p>Valid for 5 minutes.</p>`,
	});

	return c.json(
		{
			status: true,
			email: email,
			requestToken,
			message: "Otp sent successfully to email",
			otpDuration: period,
		},
		HTTPStatusCode.ACCEPTED,
	);
};

export const verifyChangeUserPasswordRequest: AppRouteHandler<
	VerifyChangeUserPassword
> = async (c) => {
	const { email, otp, requestToken } = c.req.valid("json");

	const storedCredentials = await redisClient.get(
		`otp:forgot-password:${email}`,
	);

	if (!storedCredentials)
		return c.json(
			{ message: "No such request is made" },
			HTTPStatusCode.NOT_FOUND,
		);

	const {
		otp: storedOTP,
		email: storedEmail,
		requestToken: storedRequestToken,
	} = JSON.parse(storedCredentials) as {
		otp: string;
		email: string;
		requestToken: string;
	};

	if (
		otp !== Number(storedOTP) ||
		email !== storedEmail ||
		requestToken !== storedRequestToken
	)
		return c.json(
			{
				message:
					"Entered otp is wrong or no such request made via same requestToken",
			},
			HTTPStatusCode.NOT_ACCEPTABLE,
		);

	await redisClient.del(`otp:forgot-password:${email}`);

	const verificationRequestToken = randomUUID();

	await redisClient.setex(
		`verifiedPasswordRequest:${email}`,
		600,
		JSON.stringify({
			verified: true,
			email,
			verificationRequestToken,
		}),
	);

	return c.json(
		{
			status: true,
			message: "Request is authenticated",
			email,
			verificationRequestToken,
		},
		HTTPStatusCode.ACCEPTED,
	);
};

export const changeUserPasswordWithLogin: AppRouteHandler<
	ChangeUserPasswordWithLogin
> = async (c) => {
	const { email, newPassword, verificationRequestToken } = c.req.valid("json");

	const storedRequestStatus = await redisClient.get(
		`verifiedPasswordRequest:${email}`,
	);

	if (!storedRequestStatus)
		return c.json(
			{ message: "Not such request is made" },
			HTTPStatusCode.UNAUTHORIZED,
		);

	const {
		verified,
		email: storedEmail,
		verificationRequestToken: storedVerificationRequestToken,
	} = JSON.parse(storedRequestStatus) as {
		verified: boolean;
		email: string;
		verificationRequestToken: string;
	};

	if (
		!verified ||
		storedEmail !== email ||
		storedVerificationRequestToken !== verificationRequestToken
	)
		return c.json(
			{ message: "Given request is expired or not valid" },
			HTTPStatusCode.UNAUTHORIZED,
		);

	const [user] = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.email, email));

	const samePassword = await validatePassword(newPassword, user.password);

	if (samePassword)
		return c.json(
			{
				message:
					"Given password is same as previous one , please enter a different password",
			},
			HTTPStatusCode.CONFLICT,
		);

	await redisClient.del(`verifiedPasswordRequest:${email}`);

	const newHashedPassword = await generateHashedPassword(newPassword);

	await db.update(usersTable).set({ password: newHashedPassword });

	const tokens = await generateAuthToken(user.id);

	return c.json(
		{
			status: true,
			user: {
				id: user.id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				profilePicture: user.profilePicture,
			},
			tokens,
			message: "User logged in successfully",
		},
		HTTPStatusCode.OK,
	);
};
