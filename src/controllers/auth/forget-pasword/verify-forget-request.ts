import { HTTPStatusCode } from "@/lib/constants";
import { redisClient } from "@/lib/redis-client";
import type { AppRouteHandler } from "@/lib/types";
import type { VerifyChangeUserPassword } from "@/routes/auth/forget-password.routes";
import { randomUUIDv7 } from "bun";

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
