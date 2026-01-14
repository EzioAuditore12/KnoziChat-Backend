import { defineConfig } from 'drizzle-kit';

process.loadEnvFile();

export default defineConfig({
  out: "./src/db/pg/migrations",
  schema: ["./src/user/entities/user.entity.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_POSTGRE_URL!,
  },
});