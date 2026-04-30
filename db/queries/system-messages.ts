import { eq, count, desc, sql } from "drizzle-orm";
import { db } from "../client";
import { systemMessages, type SystemMessage, type NewSystemMessage } from "../schema/system-messages";
import { messageReads } from "../schema/message-reads";
import { users } from "../schema/users";

export type SystemMessageWithAuthor = SystemMessage & { authorName: string };

export const createSystemMessage = async (data: NewSystemMessage): Promise<SystemMessage> => {
  const result = await db.insert(systemMessages).values(data).returning();
  return result[0];
};

export const getAllSystemMessages = async (): Promise<SystemMessageWithAuthor[]> => {
  return db
    .select({
      id: systemMessages.id,
      title: systemMessages.title,
      body: systemMessages.body,
      createdBy: systemMessages.createdBy,
      createdAt: systemMessages.createdAt,
      authorName: users.name,
    })
    .from(systemMessages)
    .innerJoin(users, eq(systemMessages.createdBy, users.id))
    .orderBy(desc(systemMessages.createdAt));
};

export const getRecentSystemMessages = async (limit = 5): Promise<SystemMessageWithAuthor[]> => {
  return db
    .select({
      id: systemMessages.id,
      title: systemMessages.title,
      body: systemMessages.body,
      createdBy: systemMessages.createdBy,
      createdAt: systemMessages.createdAt,
      authorName: users.name,
    })
    .from(systemMessages)
    .innerJoin(users, eq(systemMessages.createdBy, users.id))
    .orderBy(desc(systemMessages.createdAt))
    .limit(limit);
};

export const getSystemMessageById = async (id: string): Promise<SystemMessageWithAuthor | null> => {
  const result = await db
    .select({
      id: systemMessages.id,
      title: systemMessages.title,
      body: systemMessages.body,
      createdBy: systemMessages.createdBy,
      createdAt: systemMessages.createdAt,
      authorName: users.name,
    })
    .from(systemMessages)
    .innerJoin(users, eq(systemMessages.createdBy, users.id))
    .where(eq(systemMessages.id, id))
    .limit(1);
  return result[0] ?? null;
};

export const getUnreadMessageCount = async (userId: string): Promise<number> => {
  const result = await db
    .select({ total: count() })
    .from(systemMessages)
    .where(
      sql`${systemMessages.id} NOT IN (
        SELECT ${messageReads.messageId} FROM ${messageReads}
        WHERE ${messageReads.userId} = ${userId}
      )`
    );
  return result[0]?.total ?? 0;
};

export const markMessageAsRead = async (messageId: string, userId: string): Promise<void> => {
  await db
    .insert(messageReads)
    .values({ messageId, userId })
    .onConflictDoNothing();
};
