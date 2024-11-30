import { integer, pgTable, timestamp, varchar, real } from "drizzle-orm/pg-core";

export const billsModel = pgTable("bills", {
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