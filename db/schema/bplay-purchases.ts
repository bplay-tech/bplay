import { pgTable, uuid, numeric, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";

export const bplayStatusEnum = pgEnum("bplay_status", [
  "pending_payment",
  "payment_confirmed",
  "tokens_transferred",
  "failed",
]);

export const bplayPurchases = pgTable("bplay_purchases", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  usdcAmount: numeric("usdc_amount", { precision: 12, scale: 2 }).notNull(),
  bplayAmount: numeric("bplay_amount", { precision: 18, scale: 6 }).notNull(),
  exchangeRate: numeric("exchange_rate", { precision: 12, scale: 6 }).notNull(),
  buyerWallet: text("buyer_wallet").notNull(),
  txHash: text("tx_hash").unique(),
  status: bplayStatusEnum("status").notNull().default("pending_payment"),
  approvedBy: uuid("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BplayPurchase = typeof bplayPurchases.$inferSelect;
export type NewBplayPurchase = typeof bplayPurchases.$inferInsert;
