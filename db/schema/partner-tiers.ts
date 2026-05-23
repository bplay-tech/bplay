import { pgTable, uuid, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";

export const partnerTiers = pgTable("partner_tiers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).notNull(),
  minTurnoverUsd: integer("min_turnover_usd").notNull().default(0),
  color: text("color").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PartnerTier = typeof partnerTiers.$inferSelect;
export type NewPartnerTier = typeof partnerTiers.$inferInsert;
