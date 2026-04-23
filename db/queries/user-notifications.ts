import { eq } from "drizzle-orm";
import { db } from "../client";
import { userNotifications, type UserNotifications, type NewUserNotifications } from "../schema/user-notifications";

export const getNotificationsByUser = async (userId: string): Promise<UserNotifications | null> => {
  const result = await db
    .select()
    .from(userNotifications)
    .where(eq(userNotifications.userId, userId))
    .limit(1);
  return result[0] ?? null;
};

export const upsertNotifications = async (
  userId: string,
  data: Partial<Omit<NewUserNotifications, "id" | "userId">>
): Promise<UserNotifications> => {
  const result = await db
    .insert(userNotifications)
    .values({ userId, ...data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: userNotifications.userId,
      set: { ...data, updatedAt: new Date() },
    })
    .returning();
  return result[0];
};
