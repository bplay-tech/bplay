import { eq, and } from "drizzle-orm";
import { db } from "../client";
import { payoutRequests, type PayoutRequest, type NewPayoutRequest } from "../schema/payout-requests";
import { transactions } from "../schema/transactions";
import { users } from "../schema/users";

export type PayoutRequestWithUser = PayoutRequest & { userName: string };

export const getPayoutRequestsByUser = async (userId: string): Promise<PayoutRequest[]> => {
  return db.select().from(payoutRequests).where(eq(payoutRequests.userId, userId));
};

export const getAllPayoutRequests = async (): Promise<PayoutRequestWithUser[]> => {
  return db
    .select({
      id: payoutRequests.id,
      userId: payoutRequests.userId,
      amount: payoutRequests.amount,
      walletAddress: payoutRequests.walletAddress,
      payoutMethod: payoutRequests.payoutMethod,
      status: payoutRequests.status,
      reviewedBy: payoutRequests.reviewedBy,
      reviewedAt: payoutRequests.reviewedAt,
      notes: payoutRequests.notes,
      createdAt: payoutRequests.createdAt,
      userName: users.name,
    })
    .from(payoutRequests)
    .innerJoin(users, eq(payoutRequests.userId, users.id));
};

export const getPendingPayoutByUser = async (userId: string): Promise<PayoutRequest | null> => {
  const result = await db
    .select()
    .from(payoutRequests)
    .where(and(eq(payoutRequests.userId, userId), eq(payoutRequests.status, "pending")))
    .limit(1);
  return result[0] ?? null;
};

export const createPayoutRequest = async (data: NewPayoutRequest): Promise<PayoutRequest> => {
  const result = await db.insert(payoutRequests).values(data).returning();
  return result[0];
};

export const approvePayoutRequest = async (id: string, reviewerId: string): Promise<void> => {
  await db.transaction(async (tx) => {
    const [request] = await tx
      .update(payoutRequests)
      .set({ status: "approved", reviewedBy: reviewerId, reviewedAt: new Date() })
      .where(eq(payoutRequests.id, id))
      .returning();

    await tx.insert(transactions).values({
      userId: request.userId,
      type: "PAYOUT",
      amount: request.amount,
      status: "confirmed",
      notes: `Payout approved by ${reviewerId}`,
    });
  });
};

export const rejectPayoutRequest = async (id: string, reviewerId: string): Promise<void> => {
  await db
    .update(payoutRequests)
    .set({ status: "rejected", reviewedBy: reviewerId, reviewedAt: new Date() })
    .where(eq(payoutRequests.id, id));
};
