import { pgTable, uuid, numeric, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";

export const txTypeEnum = pgEnum("tx_type", ["SALE", "PAYOUT", "REFERRAL"]);
export const txStatusEnum = pgEnum("tx_status", ["pending", "confirmed", "failed"]);

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  type: txTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  buyerWallet: text("buyer_wallet"),
  txHash: text("tx_hash"),
  status: txStatusEnum("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
