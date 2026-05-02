import { pgTable, uuid, timestamp, unique } from "drizzle-orm/pg-core";
import { users } from "./users";
import { systemMessages } from "./system-messages";

export const messageReads = pgTable(
  "message_reads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    messageId: uuid("message_id").notNull().references(() => systemMessages.id),
    userId: uuid("user_id").notNull().references(() => users.id),
    readAt: timestamp("read_at").defaultNow().notNull(),
  },
  (table) => [unique("message_reads_message_user_unique").on(table.messageId, table.userId)]
);

export type MessageRead = typeof messageReads.$inferSelect;
export type NewMessageRead = typeof messageReads.$inferInsert;
