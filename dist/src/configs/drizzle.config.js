import env from "../env.js";
import { defineConfig } from "drizzle-kit";
export default defineConfig({
    out: "./src/db/migrations",
    schema: "./src/db/models/*",
    dialect: "postgresql",
    dbCredentials: {
        url: env.DATABASE_URL,
    },
});
