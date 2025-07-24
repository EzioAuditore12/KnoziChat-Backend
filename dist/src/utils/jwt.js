import env from "@/env";
import { sign, verify } from "hono/jwt";
/**
 * These are mainly 3 functions here
 *  - generateAuthTokens- to generate accessToken and refreshToken
 *  - parseAccessToken - validate accessToken and return decoded accessToken if it's signature is correct and it is not expired
 *  - parseRefreshToken - validate refreshToken and return decoded refreshToken if it's signature is correct and it is not expired
 */
/**
 * Function for creating authentatication tokens using jwt's sign method
 * @param id - takes a payload, here we are using id which we assume will come from database
 * @returns tokens:{accessToken,refreshToken}
 */
export async function generateAuthToken(id) {
    const accessToken = await sign({
        id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + env.ACCESS_EXPIRATION_DURATION,
    }, env.ACCESS_SECRET_KEY);
    const refreshToken = await sign({
        id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + env.REFRESH_EXPIRATION_DURATION,
    }, env.REFRESH_SECRET_KEY);
    const tokens = { accessToken, refreshToken };
    return tokens;
}
/**
 *  For validating accessToken and to check if it is expired or not
 * @param token - takes accessToken as parameter
 * @returns decodedToken | undefined(if expired or not valid)
 */
export async function parseAccessToken(token) {
    try {
        const decodedToken = (await verify(token, env.ACCESS_SECRET_KEY));
        return decodedToken;
    }
    catch (err) {
        return null;
    }
}
/**
 *  For validating refreshToken and to check if it is expired or not
 * @param token - takes accessToken as parameter
 * @returns decodedToken | undefined(if expired or not valid)
 */
export async function parseRefreshToken(token) {
    try {
        const decodedToken = (await verify(token, env.REFRESH_SECRET_KEY));
        return decodedToken;
    }
    catch (err) {
        console.log(err);
        return null;
    }
}
