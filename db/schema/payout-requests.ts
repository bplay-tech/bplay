import { pgTable, uuid, numeric, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";
import { payoutMethodEnum } from "./user-settings";

export const payoutStatusEnum = pgEnum("payout_status", ["pending", "approved", "rejected"]);

export const payoutRequests = pgTable("payout_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  walletAddress: text("wallet_address"),
  payoutMethod: payoutMethodEnum("payout_method").notNull(),
  status: payoutStatusEnum("status").notNull().default("pending"),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PayoutRequest = typeof payoutRequests.$inferSelect;
export type NewPayoutRequest = typeof payoutRequests.$inferInsert;
