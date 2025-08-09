import { randomUUID } from "node:crypto";
import { HTTPStatusCode } from "../../../lib/constants.js";
import { redisClient } from "../../../lib/redis-client.js";
export const verifyChangeUserPasswordRequest = async (c) => {
    const { phoneNumber, otp, requestToken } = c.req.valid("json");
    const storedCredentials = await redisClient.get(`otp:forgot-password:${phoneNumber}`);
    if (!storedCredentials)
        return c.json({ message: "No such request is made" }, HTTPStatusCode.NOT_FOUND);
    const { otp: storedOTP, phoneNumber: storedPhoneNumber, requestToken: storedRequestToken, } = JSON.parse(storedCredentials);
    if (otp !== Number(storedOTP) ||
        phoneNumber !== storedPhoneNumber ||
        requestToken !== storedRequestToken)
        return c.json({
            message: "Entered otp is wrong or no such request made via same requestToken",
        }, HTTPStatusCode.NOT_ACCEPTABLE);
    await redisClient.del(`otp:forgot-password:${phoneNumber}`);
    const verificationRequestToken = randomUUID();
    await redisClient.setex(`verifiedPasswordRequest:${phoneNumber}`, 600, JSON.stringify({
        verified: true,
        phoneNumber,
        verificationRequestToken,
    }));
    return c.json({
        status: true,
        message: "Request is authenticated",
        phoneNumber,
        verificationRequestToken,
    }, HTTPStatusCode.ACCEPTED);
};
