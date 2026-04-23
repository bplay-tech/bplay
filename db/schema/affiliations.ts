import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const affiliations = pgTable("affiliations", {
  id: uuid("id").defaultRandom().primaryKey(),
  affiliateId: uuid("affiliate_id").notNull().references(() => users.id),
  referredUserId: uuid("referred_user_id").notNull().unique().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Affiliation = typeof affiliations.$inferSelect;
export type NewAffiliation = typeof affiliations.$inferInsert;
