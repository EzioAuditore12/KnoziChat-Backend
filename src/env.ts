import { z } from "@hono/zod-openapi";

// Common server config
const serverEnvSchema = z.object({
	PORT: z.coerce.number().int().positive().default(3000),
	LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]),
	NODE_ENV: z.enum(["production", "development", "test"]),
});

// JWT config

const jwtEnvSchema = z.object({
	ACCESS_SECRET_KEY: z.string(),
	ACCESS_EXPIRES_IN: z.string().regex(/^\d+(s|m|h|d)$/i, {
		message: "Must be a number followed by s, m, h, or d (e.g., 15m, 1h, 7d)",
	}),
	REFRESH_SECRET_KEY: z.string(),
	REFRESH_EXPIRES_IN: z.string().regex(/^\d+(s|m|h|d)$/i, {
		message: "Must be a number followed by s, m, h, or d (e.g., 15m, 1h, 7d)",
	}),
});

// Database config
const dbEnvSchema = z.object({
	DATABASE_URL: z.string().url(),
});

// Redis config
const redisEnvSchema = z.object({
	REDIS_URL: z.string().url(),
});

// Nodemailer config
const mailEnvSchema = z.object({
	SMTP_HOST: z.string(),
	SMTP_USER: z.string().email(),
	SMTP_PORT: z.coerce.number().positive(),
	SMTP_PASS: z.string(),
	FROM_EMAIL: z.string().email(),
});

const otpAuthEnvSchema = z.object({
	OTPAUTH_ISSUER: z.string(),
	OTPAUTH_SECRET: z.string(),
});

export const envSchema = serverEnvSchema
	.merge(jwtEnvSchema)
	.merge(dbEnvSchema)
	.merge(redisEnvSchema)
	.merge(mailEnvSchema)
	.merge(otpAuthEnvSchema)
	.refine(
		(input) => {
			if (input.NODE_ENV === "production") {
				return input.LOG_LEVEL === "info";
			}
			return true;
		},
		{
			message: "In production we need log level to be of type info",
		},
	);

const env = envSchema.parse(process.env);

export default env;
