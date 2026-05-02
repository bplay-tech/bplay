import { eq, count, desc, sql, and } from "drizzle-orm";
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
      authorName: sql<string>`COALESCE(${users.name}, 'Unknown')`,
    })
    .from(systemMessages)
    .leftJoin(users, eq(systemMessages.createdBy, users.id))
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
      authorName: sql<string>`COALESCE(${users.name}, 'Unknown')`,
    })
    .from(systemMessages)
    .leftJoin(users, eq(systemMessages.createdBy, users.id))
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
      authorName: sql<string>`COALESCE(${users.name}, 'Unknown')`,
    })
    .from(systemMessages)
    .leftJoin(users, eq(systemMessages.createdBy, users.id))
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

export const markAllMessagesAsRead = async (userId: string): Promise<void> => {
  const all = await db.select({ id: systemMessages.id }).from(systemMessages);
  if (all.length === 0) return;
  await db
    .insert(messageReads)
    .values(all.map((m) => ({ messageId: m.id, userId })))
    .onConflictDoNothing();
};

export type SystemMessageWithReadStatus = SystemMessageWithAuthor & { isRead: boolean };

export const getSystemMessagesWithReadStatus = async (
  userId: string
): Promise<SystemMessageWithReadStatus[]> => {
  const rows = await db
    .select({
      id: systemMessages.id,
      title: systemMessages.title,
      body: systemMessages.body,
      createdBy: systemMessages.createdBy,
      createdAt: systemMessages.createdAt,
      authorName: sql<string>`COALESCE(${users.name}, 'Unknown')`,
      readId: messageReads.id,
    })
    .from(systemMessages)
    .leftJoin(users, eq(systemMessages.createdBy, users.id))
    .leftJoin(
      messageReads,
      and(
        eq(messageReads.messageId, systemMessages.id),
        eq(messageReads.userId, userId)
      )
    )
    .orderBy(desc(systemMessages.createdAt));

  return rows.map(({ readId, ...msg }) => ({ ...msg, isRead: readId !== null }));
};
