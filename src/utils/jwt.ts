import env from "@/env";
import { sign, verify } from "hono/jwt";

export async function generateAuthToken(id: string) {
	const accessToken = await sign(
		{
			id,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 240,
		},
		env.ACCESS_SECRET_KEY,
	);

	const refreshToken = await sign(
		{
			id,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day = 86400 seconds
		},
		env.REFRESH_SECRET_KEY,
	);

	const tokens = { accessToken, refreshToken };

	return tokens;
}

export interface DecodedTokenResponse {
	id: string;
	iat: number;
	exp: number;
}

export async function validateToken(token: string) {
	try {
		const decodedToken = (await verify(
			token,
			env.ACCESS_SECRET_KEY,
		)) as unknown as DecodedTokenResponse;
		return decodedToken;
	} catch (err) {
		console.log(err);
		return null;
	}
}
