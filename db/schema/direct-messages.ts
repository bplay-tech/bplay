import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";

export const directMessages = pgTable("direct_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  fromUserId: uuid("from_user_id").notNull().references(() => users.id),
  toUserId: uuid("to_user_id").notNull().references(() => users.id),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  attachmentUrl: text("attachment_url"),
  attachmentName: text("attachment_name"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DirectMessage = typeof directMessages.$inferSelect;
export type NewDirectMessage = typeof directMessages.$inferInsert;
