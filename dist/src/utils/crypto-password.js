import env from "@/env";
/**
 * Functions for generating hashed password and validating them
 * using bun's inbuilt hashing techniques which include
 * bcrypt,argon2d,argon2i,argon2id
 */
function getPasswordHashOptions() {
    const { CRYPTO_PASSWORD_ALGORITHIM, CRYPTO_PASSWORD_MEMORY_COST, CRYPTO_PASSWORD_TIME_COST, } = env;
    if (CRYPTO_PASSWORD_ALGORITHIM === "bcrypt") {
        return { algorithm: CRYPTO_PASSWORD_ALGORITHIM };
    }
    return {
        algorithm: CRYPTO_PASSWORD_ALGORITHIM,
        memoryCost: CRYPTO_PASSWORD_MEMORY_COST,
        timeCost: CRYPTO_PASSWORD_TIME_COST,
    };
}
/**
 * Converts hash for the given input password
 * @param password - accepts passowrd as string
 * @returns - returns the generated hashed password
 */
export async function generateHashedPassword(password) {
    const hashedPassword = await Bun.password.hash(password, getPasswordHashOptions());
    return hashedPassword;
}
/**
 * Compare hashed password along with the given input passsord
 * @param inputPassword - Password to be compared with
 * @param storedHashedPassword - Stored Hashed Password
 * @returns boolean
 */
export async function validatePassword(inputPassword, storedHashedPassword) {
    const isMatch = await Bun.password.verify(inputPassword, storedHashedPassword);
    return isMatch;
}
