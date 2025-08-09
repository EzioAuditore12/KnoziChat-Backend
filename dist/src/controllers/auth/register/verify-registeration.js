import { db } from "../../../db/index.js";
import { usersTable } from "../../../db/models/users.model.js";
import { HTTPStatusCode } from "../../../lib/constants.js";
import { redisClient } from "../../../lib/redis-client.js";
import { generateHashedPassword } from "../../../utils/crypto-password.js";
import { generateAuthToken } from "../../../utils/jwt.js";
export const validateRegisterationOTP = async (c) => {
    const { otp, phoneNumber, registerationToken } = c.req.valid("json");
    const storedUserData = await redisClient.get(`otp:register:${phoneNumber}`);
    if (!storedUserData)
        return c.json({ message: "OTP expired or invalid" }, HTTPStatusCode.UNAUTHORIZED);
    const { otp: storedOtp, firstName, lastName, password, profilePicture, phoneNumber: storedPhoneNumber, registerationToken: storedRegisterationToken, } = JSON.parse(storedUserData);
    if (otp !== Number(storedOtp) ||
        storedPhoneNumber !== phoneNumber ||
        storedRegisterationToken !== registerationToken) {
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
        profilePicture: typeof profilePicture === "string" ? profilePicture : null,
    })
        .returning({
        id: usersTable.id,
        email: usersTable.email,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        bio: usersTable.bio,
        profilePicture: usersTable.profilePicture,
        phoneNumber: usersTable.phoneNumber,
    });
    await redisClient.del(`otp:register:${phoneNumber}`);
    const tokens = await generateAuthToken(createdUser.id);
    return c.json({
        success: true,
        tokens,
        user: createdUser,
        message: "User created successfully",
    }, HTTPStatusCode.CREATED);
};
