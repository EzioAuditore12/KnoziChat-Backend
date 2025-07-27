import { db } from "@/db";
import { usersTable } from "@/db/models/users.model";
import { addEmailJob } from "@/jobs/sendEmail";
import { HTTPStatusCode } from "@/lib/constants";
import { redisClient } from "@/lib/redis-client";
import type { AppRouteHandler } from "@/lib/types";
import { generateHashedPassword } from "@/utils/crypto-password";
import { generateAuthToken } from "@/utils/jwt";
import { otpHelper } from "@/utils/otp-auth";
import type { RegisterUserInputs } from "@/validations/auth/register.validation";
import { eq } from "drizzle-orm";
import type {
	RegisterUserForm,
	ValidateRegisterationOTP,
} from "./register.route";
import type { UploadedFile } from "@/middlewares/hono-multer";

//TODO: Need to change middleware to run after if no errors found

export const registerUserForm: AppRouteHandler<RegisterUserForm> = async (
	c,
) => {
	const { firstName, lastName, email, password } = c.req.valid("form");

	const [existingUser] = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.email, email));

	if (existingUser)
		return c.json(
			{ message: "User with this email already exists" },
			HTTPStatusCode.CONFLICT,
		);

	const {profilePicture}=c.get("uploadedFiles") as Record<string,UploadedFile>

	const profilePictureURL=profilePicture.appwrite?.viewUrl

	console.log(profilePictureURL, typeof profilePictureURL)

	const otp = Math.floor(100000 + Math.random() * 900000).toString();
	const period = 300;

	// 10mins
	await redisClient.setex(
		`otp:register:${email}`,
		600,
		JSON.stringify({
			otp,
			firstName,
			lastName,
			password,
			profilePicture:profilePictureURL,
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
			email:email,
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
		profilePicture
	} = JSON.parse(storedUserData) as RegisterUserInputs;

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
			profilePicture: typeof profilePicture === "string" ? profilePicture : null
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
