import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const systemMessages = pgTable("system_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  attachmentUrl: text("attachment_url"),
  attachmentName: text("attachment_name"),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SystemMessage = typeof systemMessages.$inferSelect;
export type NewSystemMessage = typeof systemMessages.$inferInsert;
