import { db } from "@/db";
import { usersTable } from "@/db/models/users.model";
import { addEmailJob } from "@/jobs/sendEmail";
import { HTTPStatusCode } from "@/lib/constants";
import { redisClient } from "@/lib/redis-client";
import type { AppRouteHandler } from "@/lib/types";
import { generateHashedPassword } from "@/utils/crypto-password";
import { generateAuthToken } from "@/utils/jwt";
import { otpHelper } from "@/utils/otp-auth";
import { eq } from "drizzle-orm";
import type {
	RegisterUserForm,
	ValidateRegisterationOTP,
} from "./register.route";
import type { RegisterUserInputs } from "@/validations/auth/register.validation";

//TODO: Need to add options for fallback of user profile photo, for now assuming it to be null

export const registerUserForm: AppRouteHandler<RegisterUserForm> = async (
	c,
) => {
	const { firstName, lastName, email, password } = c.req.valid("json");

	const [existingUser] = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.email, email));

	if (existingUser)
		return c.json(
			{ message: "User with this email already exists" },
			HTTPStatusCode.CONFLICT,
		);

		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		const period=300

	// 10mins
	await redisClient.setex(
		`otp:register:${email}`,
		600,
		JSON.stringify({
			otp,
			firstName,
			lastName,
			password,
			timestamp: Date.now(),
		}),
	);

	await addEmailJob({
		toMail: email,
		subject: "Verify your registration",
		body: `<h1>Your OTP is: ${otp}</h1><p>Valid for 5 minutes.</p>`,
	});

	return c.json(
		{
			success: true,
			message: "OTP sent successfully",
			otpDuration: period,
		},
		HTTPStatusCode.ACCEPTED,
	);
};

export const validateRegisterationOTP: AppRouteHandler<
	ValidateRegisterationOTP
> = async (c) => {
	const { email, otp } = c.req.valid("json");

	const storedUserData = await redisClient.get(`otp:register:${email}`);

	if (!storedUserData)
		return c.json(
			{ message: "OTP expired or invalid" },
			HTTPStatusCode.UNAUTHORIZED,
		);

	const {
		otp: storedOtp,
		firstName,
		lastName,
		password,
	} = JSON.parse(storedUserData) as RegisterUserInputs

	if (otp !== Number(storedOtp)) {
		return c.json({ message: "Invalid OTP" }, HTTPStatusCode.UNAUTHORIZED);
	}

	const hashedPassword = await generateHashedPassword(password);

	const [createdUser] = await db
		.insert(usersTable)
		.values({
			email,
			firstName,
			lastName,
			password: hashedPassword,
		})
		.returning({
			id: usersTable.id,
			email: usersTable.email,
			firstName: usersTable.firstName,
			lastName: usersTable.lastName,
			profilePicture: usersTable.profilePicture,
		});

	await redisClient.del(`otp:register:${email}`);

	const tokens = await generateAuthToken(createdUser.id);

	return c.json(
		{
			success: true,
			tokens,
			user: createdUser,
			message: "User created successfully",
		},
		HTTPStatusCode.CREATED,
	);
};
