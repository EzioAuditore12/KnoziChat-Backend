import { z } from "@hono/zod-openapi";

export const envSchema = z.object({
	PORT: z.coerce.number().int().positive().default(3000),
	DATABASE_URL: z.string(),
	LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]),
	NODE_ENV: z.enum(["production", "development", "test"]),
	REDIS_URL: z.url(),
});

const env = envSchema.parse(process.env);

export default env;
