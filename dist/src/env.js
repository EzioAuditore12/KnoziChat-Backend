import { z } from "@hono/zod-openapi";
const serverEnvSchema = z.object({
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.string(),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]),
    NODE_ENV: z.enum(["production", "development", "test"]),
    REDIS_URL: z.string().url(),
});
const cryptoPasswordConfigSchema = z
    .object({
    CRYPTO_PASSWORD_ALGORITHIM: z.enum([
        "argon2id",
        "argon2d",
        "argon2i",
        "bcrypt",
    ]),
    CRYPTO_PASSWORD_MEMORY_COST: z.coerce.number().int().positive().optional(),
    CRYPTO_PASSWORD_TIME_COST: z.coerce.number().int().positive().optional(),
})
    .refine((input) => {
    const isBcrypt = input.CRYPTO_PASSWORD_ALGORITHIM === "bcrypt";
    const hasMemoryCost = input.CRYPTO_PASSWORD_MEMORY_COST !== undefined;
    const hasTimeCost = input.CRYPTO_PASSWORD_TIME_COST !== undefined;
    if (isBcrypt) {
        return !hasMemoryCost && !hasTimeCost;
    }
    return hasMemoryCost && hasTimeCost;
}, {
    message: "memoryCost and timeCost must only be set for Argon2 algorithms, not for bcrypt.",
    path: ["CRYPTO_PASSWORD_MEMORY_COST", "CRYPTO_PASSWORD_TIME_COST"],
});
const jwtConfigSchema = z.object({
    ACCESS_SECRET_KEY: z.string(),
    ACCESS_EXPIRATION_DURATION: z.coerce.number().positive(),
    REFRESH_SECRET_KEY: z.string(),
    REFRESH_EXPIRATION_DURATION: z.coerce.number().positive(),
});
const envSchema = serverEnvSchema
    .and(cryptoPasswordConfigSchema)
    .and(jwtConfigSchema);
const env = envSchema.parse(process.env);
export default env;
