import { eq, desc, sql, and, or } from "drizzle-orm";
import { db } from "../client";
import { directMessages, type DirectMessage, type NewDirectMessage } from "../schema/direct-messages";
import { users } from "../schema/users";

export type DirectMessageWithSender = DirectMessage & {
  senderName: string;
  senderEmail: string;
};

export type DirectMessageWithRecipient = DirectMessage & {
  recipientName: string;
  recipientEmail: string;
};

const inboxSelect = {
  id: directMessages.id,
  fromUserId: directMessages.fromUserId,
  toUserId: directMessages.toUserId,
  subject: directMessages.subject,
  body: directMessages.body,
  attachmentUrl: directMessages.attachmentUrl,
  attachmentName: directMessages.attachmentName,
  isRead: directMessages.isRead,
  createdAt: directMessages.createdAt,
  senderName: sql<string>`COALESCE(${users.name}, 'Unknown')`,
  senderEmail: sql<string>`COALESCE(${users.email}, '')`,
};

export const createDirectMessage = async (data: NewDirectMessage): Promise<DirectMessage> => {
  const result = await db.insert(directMessages).values(data).returning();
  return result[0];
};

export const getInboxForUser = async (userId: string): Promise<DirectMessageWithSender[]> => {
  return db
    .select(inboxSelect)
    .from(directMessages)
    .leftJoin(users, eq(directMessages.fromUserId, users.id))
    .where(eq(directMessages.toUserId, userId))
    .orderBy(desc(directMessages.createdAt));
};

export const getSentByUser = async (userId: string): Promise<DirectMessageWithRecipient[]> => {
  return db
    .select({
      id: directMessages.id,
      fromUserId: directMessages.fromUserId,
      toUserId: directMessages.toUserId,
      subject: directMessages.subject,
      body: directMessages.body,
      attachmentUrl: directMessages.attachmentUrl,
      attachmentName: directMessages.attachmentName,
      isRead: directMessages.isRead,
      createdAt: directMessages.createdAt,
      recipientName: sql<string>`COALESCE(${users.name}, 'Unknown')`,
      recipientEmail: sql<string>`COALESCE(${users.email}, '')`,
    })
    .from(directMessages)
    .leftJoin(users, eq(directMessages.toUserId, users.id))
    .where(eq(directMessages.fromUserId, userId))
    .orderBy(desc(directMessages.createdAt));
};

export const getDirectMessageById = async (id: string): Promise<DirectMessageWithSender | null> => {
  const result = await db
    .select(inboxSelect)
    .from(directMessages)
    .leftJoin(users, eq(directMessages.fromUserId, users.id))
    .where(eq(directMessages.id, id))
    .limit(1);
  return result[0] ?? null;
};

export const getUnreadDirectMessageCount = async (userId: string): Promise<number> => {
  const result = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(directMessages)
    .where(and(eq(directMessages.toUserId, userId), eq(directMessages.isRead, false)));
  return result[0]?.total ?? 0;
};

export const markDirectMessageRead = async (id: string, userId: string): Promise<void> => {
  await db
    .update(directMessages)
    .set({ isRead: true })
    .where(and(eq(directMessages.id, id), eq(directMessages.toUserId, userId)));
};

export const deleteDirectMessageById = async (id: string): Promise<void> => {
  await db.delete(directMessages).where(eq(directMessages.id, id));
};

export const deleteDirectMessagesByUser = async (userId: string): Promise<void> => {
  await db
    .delete(directMessages)
    .where(or(eq(directMessages.fromUserId, userId), eq(directMessages.toUserId, userId)));
};
