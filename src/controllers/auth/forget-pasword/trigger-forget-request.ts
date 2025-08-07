import { db } from "@/db";
import { usersTable } from "@/db/models/users.model";
import { addSMSJob } from "@/jobs/sendSMS";
import { HTTPStatusCode } from "@/lib/constants";
import { redisClient } from "@/lib/redis-client";
import type { AppRouteHandler } from "@/lib/types";
import type { ForgotPasswordTrigger } from "@/routes/auth/forget-password.routes";
import { randomUUIDv7 } from "bun";
import { eq } from "drizzle-orm";

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
