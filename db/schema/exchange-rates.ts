import { pgTable, uuid, numeric, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const exchangeRates = pgTable("exchange_rates", {
  id: uuid("id").defaultRandom().primaryKey(),
  rate: numeric("rate", { precision: 12, scale: 6 }).notNull(),
  usdcContractAddress: text("usdc_contract_address").notNull(),
  treasuryAddress: text("treasury_address").notNull(),
  updatedBy: uuid("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type NewExchangeRate = typeof exchangeRates.$inferInsert;
