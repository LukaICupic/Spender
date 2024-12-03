import { relations } from "drizzle-orm";
import { integer, pgTable, timestamp, varchar, real } from "drizzle-orm/pg-core";

export const billModel = pgTable("bill", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  category: varchar({ length: 255 }).notNull(), //ReceiptCategory
  amount: real().notNull(),
  payer: varchar({ length: 255 }).notNull(),
  date_of_payment: timestamp().notNull(),
});

export const userModel = pgTable("user", {
  id: integer().primaryKey(),
  user_name: varchar({ length: 255 }).notNull(),
  password: varchar({ length: 255 }).notNull()
})

export const categoryModel = pgTable("category", {
  id: integer().primaryKey(),
  category_name: varchar({ length: 255 }).notNull(),
  bill_id: integer('bill_id').references(() => billModel.id),
  user_id: integer('user_id').references(() => userModel.id),
})

export const billRelations = relations(billModel, ({ one }) => ({
	bill_category: one(categoryModel),
}));

export const userRelations = relations(userModel, ({ many }) => ({
  categories: many(categoryModel),
}));

export const categoryRelations = relations(categoryModel, ({ one }) => ({
  user: one(userModel),
}));