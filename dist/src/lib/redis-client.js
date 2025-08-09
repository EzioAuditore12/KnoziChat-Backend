import env from "../env.js";
import IORedis from "ioredis";
export const redisClient = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
});
