import env from "@/env";
import IORedis from "ioredis";

export const redisClient = new IORedis(env.REDIS_URL, {
	maxRetriesPerRequest: null,
});
