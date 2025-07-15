import { compare, genSalt, hash } from "bcrypt";

export async function generateHashedPassword(password: string) {
	const salt = await genSalt();
	return await hash(password, salt);
}

export async function comparePasswords(
	passwordInput: string,
	passwordStored: string,
): Promise<boolean> {
	return await compare(passwordInput, passwordStored);
}
