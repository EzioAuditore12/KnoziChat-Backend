import { randomUUID } from "node:crypto";
import { db } from "../../../db/index.js";
import { usersTable } from "../../../db/models/users.model.js";
import { addSMSJob } from "../../../jobs/sendSMS.js";
import { HTTPStatusCode } from "../../../lib/constants.js";
import { redisClient } from "../../../lib/redis-client.js";
import { eq } from "drizzle-orm";
//TODO: Need to change middleware to run after if no errors found
export const registerUserForm = async (c) => {
    const { firstName, lastName, password, phoneNumber } = c.req.valid("form");
    const [existingUser] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.phoneNumber, phoneNumber));
    if (existingUser)
        return c.json({ message: "User with this phone number already exists" }, HTTPStatusCode.CONFLICT);
    const { profilePicture } = c.get("uploadedFiles");
    const profilePictureURL = profilePicture.appwrite?.viewUrl;
    console.log(profilePictureURL, typeof profilePictureURL);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const period = 300;
    const registerationToken = randomUUID();
    // 10mins
    await redisClient.setex(`otp:register:${phoneNumber}`, 600, JSON.stringify({
        otp,
        firstName,
        lastName,
        password,
        registerationToken,
        phoneNumber,
        profilePicture: profilePictureURL,
        timestamp: Date.now(),
    }));
    await addSMSJob({
        recipient: phoneNumber,
        message: `OTP for registeration is ${otp}`,
    });
    return c.json({
        success: true,
        registerationToken,
        phoneNumber,
        message: "OTP sent successfully",
        otpDuration: period,
    }, HTTPStatusCode.ACCEPTED);
};
