import { db } from "@/db";
import { usersTable } from "@/db/models/users.model";
import { addSMSJob } from "@/jobs/sendSMS";
import { HTTPStatusCode } from "@/lib/constants";
import { redisClient } from "@/lib/redis-client";
import type { AppRouteHandler } from "@/lib/types";
import type { UploadedFile } from "@/middlewares/hono-multer";
import { generateHashedPassword } from "@/utils/crypto-password";
import { generateAuthToken } from "@/utils/jwt";
import { otpHelper } from "@/utils/otp-auth";
import type { RegisterUserInputs } from "@/validations/auth/register.validation";
import { randomUUIDv7 } from "bun";
import { eq } from "drizzle-orm";
import type {
	RegisterUserForm,
	ValidateRegisterationOTP,
} from "./register.route";

//TODO: Need to change middleware to run after if no errors found

export const registerUserForm: AppRouteHandler<RegisterUserForm> = async (
	c,
) => {
	const { firstName, lastName, password, phoneNumber } = c.req.valid("form");

	const [existingUser] = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.phoneNumber, phoneNumber));

	if (existingUser)
		return c.json(
			{ message: "User with this phone number already exists" },
			HTTPStatusCode.CONFLICT,
		);

	const { profilePicture } = c.get("uploadedFiles") as Record<
		string,
		UploadedFile
	>;

	const profilePictureURL = profilePicture.appwrite?.viewUrl;

	console.log(profilePictureURL, typeof profilePictureURL);

	const otp = Math.floor(100000 + Math.random() * 900000).toString();
	const period = 300;

	const registerationToken = randomUUIDv7();

	// 10mins
	await redisClient.setex(
		`otp:register:${phoneNumber}`,
		600,
		JSON.stringify({
			otp,
			firstName,
			lastName,
			password,
			registerationToken,
			phoneNumber,
			profilePicture: profilePictureURL,
			timestamp: Date.now(),
		}),
	);

	await addSMSJob({
		recipient: phoneNumber,
		message: `OTP for registeration is ${otp}`,
	});

	return c.json(
		{
			success: true,
			registerationToken,
			phoneNumber,
			message: "OTP sent successfully",
			otpDuration: period,
		},
		HTTPStatusCode.ACCEPTED,
	);
};

export const validateRegisterationOTP: AppRouteHandler<
	ValidateRegisterationOTP
> = async (c) => {
	const { otp, phoneNumber, registerationToken } = c.req.valid("json");

	const storedUserData = await redisClient.get(`otp:register:${phoneNumber}`);

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
		profilePicture,
		phoneNumber: storedPhoneNumber,
		registerationToken: storedRegisterationToken,
	} = JSON.parse(storedUserData) as RegisterUserInputs;

	if (
		otp !== Number(storedOtp) ||
		storedPhoneNumber !== phoneNumber ||
		storedRegisterationToken !== registerationToken
	) {
		return c.json({ message: "Invalid OTP" }, HTTPStatusCode.UNAUTHORIZED);
	}

	const hashedPassword = await generateHashedPassword(password);

	const [createdUser] = await db
		.insert(usersTable)
		.values({
			phoneNumber,
			firstName,
			lastName,
			password: hashedPassword,
			profilePicture:
				typeof profilePicture === "string" ? profilePicture : null,
		})
		.returning({
			id: usersTable.id,
			email: usersTable.email,
			firstName: usersTable.firstName,
			lastName: usersTable.lastName,
			profilePicture: usersTable.profilePicture,
			phoneNumber: usersTable.phoneNumber,
		});

	await redisClient.del(`otp:register:${phoneNumber}`);

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
