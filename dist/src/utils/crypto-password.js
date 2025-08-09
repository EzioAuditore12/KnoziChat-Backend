import { compare, genSalt, hash } from "bcrypt";
/**
 * Converts hash for the given input password
 * @param password - accepts passowrd as string
 * @returns - returns the generated hashed password
 */
export async function generateHashedPassword(password) {
    const salt = await genSalt();
    return await hash(password, salt);
}
/**
 * Compare hashed password along with the given input passsord
 * @param inputPassword - Password to be compared with
 * @param storedHashedPassword - Stored Hashed Password
 * @returns boolean
 */
export async function validatePassword(passwordInput, passwordStored) {
    return await compare(passwordInput, passwordStored);
}
