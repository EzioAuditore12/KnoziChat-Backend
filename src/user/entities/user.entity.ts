import { sql } from 'drizzle-orm';
import { pgTable, uuid, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { createZodDto } from 'nestjs-zod';
import {z} from 'zod';

export const userEntity = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  middleName: varchar('middle_name', { length: 50 }),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }).unique().notNull(),
  email: varchar('email', { length: 240 }).unique(),
  password: text('password').notNull(),
  expoPushToken: text(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const userSelectSchema = createSelectSchema(userEntity);
export const userInsertSchema = createInsertSchema(userEntity);

export class User extends createZodDto(userSelectSchema) {}
