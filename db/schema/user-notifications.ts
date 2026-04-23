import { pgTable, uuid, boolean, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const userNotifications = pgTable("user_notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().unique().references(() => users.id),
  newSale: boolean("new_sale").notNull().default(true),
  weeklyReport: boolean("weekly_report").notNull().default(true),
  payoutConfirm: boolean("payout_confirm").notNull().default(true),
  teamActivity: boolean("team_activity").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type UserNotifications = typeof userNotifications.$inferSelect;
export type NewUserNotifications = typeof userNotifications.$inferInsert;
