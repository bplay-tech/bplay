import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const invitationTokens = pgTable("invitation_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  token: uuid("token").defaultRandom().notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type InvitationToken = typeof invitationTokens.$inferSelect;
export type NewInvitationToken = typeof invitationTokens.$inferInsert;
