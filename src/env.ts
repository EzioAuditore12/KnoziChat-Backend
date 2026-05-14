import { z } from 'zod';

process.loadEnvFile();

const timeSchema = z.custom<`${number}${'ms' | 's' | 'm' | 'h' | 'd'}`>(
  (val) => typeof val === 'string',
);

export const envSchema = z.object({
  PORT: z.coerce.number().default(8000),

  DATABASE_POSTGRE_URL: z.string(),

  DATABASE_MONGODB_URL: z.string(),

  REDIS_URL: z.string(),

  JWT_SECRET: z.string(),
  JWT_EXPIRE_IN: timeSchema.default('15m'),

  REFRESH_JWT_SECRET: z.string(),
  REFRESH_JWT_EXPIRE_IN: timeSchema.default('7d'),

  APPWRITE_PROJECT_ID: z.string(),
  APPWRITE_END_POINT: z.string(),
  APPWRITE_API_KEY: z.string(),
  APPWRITE_BUCKET_ID: z.string(),
});

export const env = envSchema.parse(process.env);
