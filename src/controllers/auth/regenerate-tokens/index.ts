import { db } from "@/db";
import { blackListedRefreshTokenTable } from "@/db/models/blacklistRefreshToken.model";
import { usersTable } from "@/db/models/users.model";
import { HTTPStatusCode } from "@/lib/constants";
import type { AppRouteHandler } from "@/lib/types";
import type { RegenerateTokens } from "@/routes/auth/regenerateTokens.route";
import { generateAuthToken, parseRefreshToken } from "@/utils/jwt";
import { eq } from "drizzle-orm";

export const RegenerateTokensHandler: AppRouteHandler<
	RegenerateTokens
> = async (c) => {
	const { oldRefreshToken } = c.req.valid("json");

	const oldDecodedRefreshToken = await parseRefreshToken(oldRefreshToken);

	if (!oldDecodedRefreshToken)
		return c.json(
			{ message: "Given token is invalid or expired" },
			HTTPStatusCode.UNAUTHORIZED,
		);

	const userId = oldDecodedRefreshToken.id;

	const [user] = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.id, userId));

	if (!user)
		return c.json(
			{ message: "Given user id does not exist" },
			HTTPStatusCode.NOT_FOUND,
		);

	await db.insert(blackListedRefreshTokenTable).values({
		userId: user.id,
		refresh_token: oldRefreshToken,
		createdAt: new Date(oldDecodedRefreshToken.iat * 1000),
		expiredAt: new Date(oldDecodedRefreshToken.exp * 1000),
	});

	const { accessToken, refreshToken } = await generateAuthToken(user.id);

	return c.json(
		{
			status: true,
			message: "Generation of tokens successfull",
			tokens: {
				accessToken,
				refreshToken,
			},
		},
		HTTPStatusCode.CREATED,
	);
};
