import { db } from "@/db";
import { usersTable } from "@/db/models/users.model";
import { addSMSJob } from "@/jobs/sendSMS";
import { HTTPStatusCode } from "@/lib/constants";
import { redisClient } from "@/lib/redis-client";
import type { AppRouteHandler } from "@/lib/types";
import {
	generateHashedPassword,
	validatePassword,
} from "@/utils/crypto-password";
import { generateAuthToken } from "@/utils/jwt";
import { randomUUIDv7 } from "bun";
import { eq } from "drizzle-orm";
import type {
	ChangeUserPasswordWithLogin,
	ForgotPasswordTrigger,
	VerifyChangeUserPassword,
} from "../login.route";

export const forgotPasswordTrigger: AppRouteHandler<
	ForgotPasswordTrigger
> = async (c) => {
	const { phoneNumber } = c.req.valid("json");

	const [user] = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.phoneNumber, phoneNumber));

	if (!user)
		return c.json(
			{ message: "Given user not found" },
			HTTPStatusCode.NOT_FOUND,
		);

	const otp = Math.floor(100000 + Math.random() * 900000).toString();
	const period = 600;

	const requestToken = randomUUIDv7();

	await redisClient.setex(
		`otp:forgot-password:${phoneNumber}`,
		period,
		JSON.stringify({
			otp,
			phoneNumber,
			requestToken,
		}),
	);

	await addSMSJob({
		recipient: phoneNumber,
		message: `OTP for changing password is ${otp}`,
	});

	/*
	await addEmailJob({
		toMail: email,
		subject: "Otp for changing password",
		body: `<h1>Your OTP is: ${otp}</h1><p>Valid for 5 minutes.</p>`,
	});
	*/

	return c.json(
		{
			status: true,
			phoneNumber,
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
	const { phoneNumber, otp, requestToken } = c.req.valid("json");

	const storedCredentials = await redisClient.get(
		`otp:forgot-password:${phoneNumber}`,
	);

	if (!storedCredentials)
		return c.json(
			{ message: "No such request is made" },
			HTTPStatusCode.NOT_FOUND,
		);

	const {
		otp: storedOTP,
		phoneNumber: storedPhoneNumber,
		requestToken: storedRequestToken,
	} = JSON.parse(storedCredentials) as {
		otp: string;
		phoneNumber: string;
		requestToken: string;
	};

	if (
		otp !== Number(storedOTP) ||
		phoneNumber !== storedPhoneNumber ||
		requestToken !== storedRequestToken
	)
		return c.json(
			{
				message:
					"Entered otp is wrong or no such request made via same requestToken",
			},
			HTTPStatusCode.NOT_ACCEPTABLE,
		);

	await redisClient.del(`otp:forgot-password:${phoneNumber}`);

	const verificationRequestToken = randomUUIDv7();

	await redisClient.setex(
		`verifiedPasswordRequest:${phoneNumber}`,
		600,
		JSON.stringify({
			verified: true,
			phoneNumber,
			verificationRequestToken,
		}),
	);

	return c.json(
		{
			status: true,
			message: "Request is authenticated",
			phoneNumber,
			verificationRequestToken,
		},
		HTTPStatusCode.ACCEPTED,
	);
};

export const changeUserPasswordWithLogin: AppRouteHandler<
	ChangeUserPasswordWithLogin
> = async (c) => {
	const { phoneNumber, newPassword, verificationRequestToken } =
		c.req.valid("json");

	const storedRequestStatus = await redisClient.get(
		`verifiedPasswordRequest:${phoneNumber}`,
	);

	if (!storedRequestStatus)
		return c.json(
			{ message: "Not such request is made" },
			HTTPStatusCode.UNAUTHORIZED,
		);

	const {
		verified,
		phoneNumber: storedPhoneNumber,
		verificationRequestToken: storedVerificationRequestToken,
	} = JSON.parse(storedRequestStatus) as {
		verified: boolean;
		phoneNumber: string;
		verificationRequestToken: string;
	};

	if (
		!verified ||
		storedPhoneNumber !== phoneNumber ||
		storedVerificationRequestToken !== verificationRequestToken
	)
		return c.json(
			{ message: "Given request is expired or not valid" },
			HTTPStatusCode.UNAUTHORIZED,
		);

	const [user] = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.phoneNumber, phoneNumber));

	const samePassword = await validatePassword(newPassword, user.password);

	if (samePassword)
		return c.json(
			{
				message:
					"Given password is same as previous one , please enter a different password",
			},
			HTTPStatusCode.CONFLICT,
		);

	await redisClient.del(`verifiedPasswordRequest:${phoneNumber}`);

	const newHashedPassword = await generateHashedPassword(newPassword);

	await db
		.update(usersTable)
		.set({ password: newHashedPassword })
		.where(eq(usersTable.phoneNumber, phoneNumber));

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
				phoneNumber: user.phoneNumber,
			},
			tokens,
			message: "User logged in successfully",
		},
		HTTPStatusCode.OK,
	);
};
