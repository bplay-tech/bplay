import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "../client";
import { invitationTokens, type InvitationToken } from "../schema/invitation-tokens";
import { users, type User } from "../schema/users";

export type InvitationTokenWithUser = InvitationToken & { user: User };

export const createInvitationToken = async (userId: string): Promise<string> => {
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
  const result = await db
    .insert(invitationTokens)
    .values({ userId, expiresAt })
    .returning();
  return result[0].token;
};

export const getValidInvitationToken = async (
  token: string
): Promise<InvitationTokenWithUser | null> => {
  const result = await db
    .select({ invitation: invitationTokens, user: users })
    .from(invitationTokens)
    .innerJoin(users, eq(invitationTokens.userId, users.id))
    .where(
      and(
        eq(invitationTokens.token, token),
        isNull(invitationTokens.usedAt),
        gt(invitationTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!result[0]) return null;
  return { ...result[0].invitation, user: result[0].user };
};

export const markTokenUsed = async (id: string): Promise<void> => {
  await db
    .update(invitationTokens)
    .set({ usedAt: new Date() })
    .where(eq(invitationTokens.id, id));
};
