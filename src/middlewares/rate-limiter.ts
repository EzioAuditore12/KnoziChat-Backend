import { HTTPStatusCode } from "@/lib/constants";
import { redisClient } from "@/lib/redis-client";
import { getConnInfo } from "@hono/node-server/conninfo";
import { createMiddleware } from "hono/factory";

interface RateLimiterProps {
	limit: number;
	windowTime: number;
}

export function rateLimiter({ limit, windowTime }: RateLimiterProps) {
	return createMiddleware(async (c, next) => {
		const { remote } = getConnInfo(c);
		const key = `rate-limit:${remote.address}`;

		const requests = await redisClient.incr(key);

		if (requests === 1) await redisClient.expire(key, windowTime);

		if (requests > limit)
			return c.json(
				{
					message: `Too many requests, try again later in ${windowTime / 60} mins`,
					seconds: windowTime,
				},
				HTTPStatusCode.TOO_MANY_REQUESTS,
			);

		await next();
	});
}
