import { relations, sql } from "drizzle-orm";
import { integer, pgTable, timestamp, varchar, real, uuid } from "drizzle-orm/pg-core";

export const billModel = pgTable("bill", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(), 
  category_id: integer("category_id") 
    .references(() => categoryModel.id)
    .notNull(),
  user_id: integer("user_id") 
    .references(() => userModel.id)
    .notNull(),
  amount: real().notNull(),
  date_of_payment: timestamp({withTimezone:true}).notNull(),
});

export const userModel = pgTable("user", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_name: varchar({ length: 255 }).notNull(),
  password: varchar({ length: 255 }).notNull()
})

export const categoryModel = pgTable("category", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(), 
  name: varchar({ length: 255 }).notNull(),
  user_id: integer("user_id") 
    .references(() => userModel.id)
    .notNull(),
});

export const sessionModel = pgTable("session", {
  session_id: uuid().notNull().primaryKey(),
  user_id: integer().notNull(),
  created_at: timestamp().default(sql`now()`),
  expires_at: timestamp().notNull()
})

export const billRelations = relations(billModel, ({ one }) => ({
  user: one(userModel),
  category: one(categoryModel),
}));

export const userRelations = relations(userModel, ({ many }) => ({
  bills: many(billModel), 
  categories: many(categoryModel),
}));

export const categoryRelations = relations(categoryModel, ({ one, many }) => ({
  user: one(userModel),
  bills: many(billModel),
}));