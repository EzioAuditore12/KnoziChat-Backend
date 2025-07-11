import { z } from "@hono/zod-openapi";

export const envSchema = z
	.object({
		PORT: z.coerce.number().int().positive().default(3000),
		LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]),
		NODE_ENV: z.enum(["production", "development", "test"]),
		DATABASE_URL: z.string().url(),
		DATABASE_AUTH_TOKEN: z.string().optional(),
	})
	.refine(
		(input) => {
			if (input.NODE_ENV === "production") {
				return !!input.DATABASE_AUTH_TOKEN;
			}
			return true;
		},
		{
			message: "DATABASE_AUTH_TOKEN is required in production",
		},
	);

const env = envSchema.parse(process.env);

export default env;
