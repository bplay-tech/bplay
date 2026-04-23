import { eq } from "drizzle-orm";
import { db } from "../client";
import { userSettings, type UserSettings, type NewUserSettings } from "../schema/user-settings";

export const getSettingsByUser = async (userId: string): Promise<UserSettings | null> => {
  const result = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);
  return result[0] ?? null;
};

export const upsertSettings = async (
  userId: string,
  data: Partial<Omit<NewUserSettings, "id" | "userId">>
): Promise<UserSettings> => {
  const result = await db
    .insert(userSettings)
    .values({ userId, ...data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: userSettings.userId,
      set: { ...data, updatedAt: new Date() },
    })
    .returning();
  return result[0];
};
