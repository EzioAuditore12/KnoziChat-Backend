import { boolean, pgTable,time,uuid, varchar } from "drizzle-orm/pg-core";

export const taskSchema=pgTable("tasks",{
    id:uuid().unique().primaryKey().defaultRandom(),
    name:varchar({length:50}).notNull(),
    done:boolean().default(false).notNull(),
    createdAt:time().defaultNow(),
    updatedAt:time().$onUpdate(() => new Date().toISOString())
})