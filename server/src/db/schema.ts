import { integer, pgTable, timestamp, varchar, real } from "drizzle-orm/pg-core";

export const billsTable = pgTable("bills", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  category: integer().notNull(), //ReceiptCategory
  payee_name: varchar({ length: 255 }),
  payee_address: varchar({ length: 255 }),
  payee_iban: varchar({ length: 255 }),
  amount: real().notNull(),
  payer_name: varchar({ length: 255 }),
  ref_model: varchar({ length: 4 }),
  ref_number: varchar({ length: 22 }),
  purpose_code: varchar({ length: 255 }),
  payment_description: varchar({ length: 255 }),
  date_of_payment: timestamp(),
});