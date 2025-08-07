import { db } from "@/db";
import { usersTable } from "@/db/models/users.model";
import { HTTPStatusCode } from "@/lib/constants";
import { redisClient } from "@/lib/redis-client";
import type { AppRouteHandler } from "@/lib/types";
import type { ChangeUserPasswordWithLogin } from "@/routes/auth/forget-password.routes";
import {
	generateHashedPassword,
	validatePassword,
} from "@/utils/crypto-password";
import { generateAuthToken } from "@/utils/jwt";
import { eq } from "drizzle-orm";

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
