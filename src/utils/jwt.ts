import env from "@/env";
import { sign } from "hono/jwt";

export async function generateAuthToken(id: string) {
	const accessToken = await sign(
		{
			id,
			exp: Math.floor(Date.now() / 1000) + 10,
		},
		env.ACCESS_SECRET_KEY,
	);

	const refreshToken = await sign(
		{
			id,
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day = 86400 seconds
		},
		env.REFRESH_SECRET_KEY,
	);

	const tokens = { accessToken, refreshToken };

	return tokens;
}
