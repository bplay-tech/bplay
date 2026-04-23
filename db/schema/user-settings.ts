import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";

export const payoutMethodEnum = pgEnum("payout_method", ["USDC", "BANK_TRANSFER"]);

export const userSettings = pgTable("user_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().unique().references(() => users.id),
  walletAddress: text("wallet_address"),
  preferredPayoutMethod: payoutMethodEnum("preferred_payout_method").notNull().default("USDC"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;
