import env from "@/env";
import { createClient } from "redis";

export const redisClient = createClient({
	url: env.REDIS_URL,
});

redisClient
	.connect()
	.then(() => console.log("Redis datbaase started"))
	.catch(console.error);

export const RedisClient = () => redisClient;
