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

// RabbitMQ config
const rabbitEnvSchema = z.object({
	RABBIT_MQ_PROTOCOL: z.enum(["amqp", "amqp"]),
	RABBIT_MQ_PORT: z.coerce.number().int().positive().default(5672),
	RABBIT_MQ_HOSTNAME: z.string(),
	RABBIT_MQ_USERNAME: z.string(),
	RABBIT_MQ_PASSWORD: z.string(),
});

// Nodemailer config
const mailEnvSchema = z.object({
	NODEMAILER_USERNAME: z.string(),
	NODEMAILER_PASSWORD: z.string(),
});

const otpAuthEnvSchema = z.object({
	OTPAUTH_ISSUER: z.string(),
	OTPAUTH_SECRET: z.string(),
});

export const envSchema = serverEnvSchema
	.merge(jwtEnvSchema)
	.merge(dbEnvSchema)
	.merge(redisEnvSchema)
	.merge(rabbitEnvSchema)
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
