import { randomUUID } from "node:crypto";
import { db } from "../../../db/index.js";
import { usersTable } from "../../../db/models/users.model.js";
import { addSMSJob } from "../../../jobs/sendSMS.js";
import { HTTPStatusCode } from "../../../lib/constants.js";
import { redisClient } from "../../../lib/redis-client.js";
import { eq } from "drizzle-orm";
export const forgotPasswordTrigger = async (c) => {
    const { phoneNumber } = c.req.valid("json");
    const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.phoneNumber, phoneNumber));
    if (!user)
        return c.json({ message: "Given user not found" }, HTTPStatusCode.NOT_FOUND);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const period = 600;
    const requestToken = randomUUID();
    await redisClient.setex(`otp:forgot-password:${phoneNumber}`, period, JSON.stringify({
        otp,
        phoneNumber,
        requestToken,
    }));
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
    return c.json({
        status: true,
        phoneNumber,
        requestToken,
        message: "Otp sent successfully to email",
        otpDuration: period,
    }, HTTPStatusCode.ACCEPTED);
};
