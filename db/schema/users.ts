import { pgTable, text, uuid, timestamp, boolean, pgEnum, numeric } from "drizzle-orm/pg-core";
import { partnerTiers } from "./partner-tiers";

export const userRoleEnum = pgEnum("user_role", ["USER", "SALES", "ADMIN", "SUPER_ADMIN"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default("USER"),
  partnerTierId: uuid("partner_tier_id").notNull().references(() => partnerTiers.id),
  referralCode: text("referral_code").notNull().unique(),
  transferAddress: text("transfer_address"),
  isActive: boolean("is_active").notNull().default(true),
  cumulatedCommissions: numeric("cumulated_commissions", { precision: 12, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
