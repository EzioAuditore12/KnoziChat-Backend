import { z } from "@hono/zod-openapi";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import validator from "validator";
import { usersTable } from "./users.model.js";
export const blackListedRefreshTokenTable = pgTable("blacklisted-refresh-token-table", {
    id: uuid().primaryKey().defaultRandom().notNull(),
    userId: uuid()
        .notNull()
        .references(() => usersTable.id),
    refresh_token: text().notNull(),
    createdAt: timestamp().notNull(),
    expiredAt: timestamp().notNull(),
});
export const BlacklistRefreshTokenInsertionSchema = createInsertSchema(blackListedRefreshTokenTable)
    .omit({
    id: true,
})
    .extend({
    token: z.string().refine((val) => validator.isJWT(val), {
        message: "Invalid jwt token",
    }),
});
