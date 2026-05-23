import { eq, and, desc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "../client";
import { payoutRequests, type PayoutRequest, type NewPayoutRequest } from "../schema/payout-requests";
import { transactions } from "../schema/transactions";
import { users } from "../schema/users";

export type PayoutRequestEnriched = PayoutRequest & { reviewerName: string | null };
export type PayoutRequestWithUser = PayoutRequest & { userName: string; reviewerName: string | null };

const PAYOUT_COLS = {
  id: payoutRequests.id,
  userId: payoutRequests.userId,
  amount: payoutRequests.amount,
  walletAddress: payoutRequests.walletAddress,
  payoutMethod: payoutRequests.payoutMethod,
  status: payoutRequests.status,
  reviewedBy: payoutRequests.reviewedBy,
  reviewedAt: payoutRequests.reviewedAt,
  txHash: payoutRequests.txHash,
  notes: payoutRequests.notes,
  createdAt: payoutRequests.createdAt,
};

export const getPayoutRequestsByUser = async (userId: string): Promise<PayoutRequestEnriched[]> => {
  const reviewer = alias(users, "reviewer");
  return db
    .select({ ...PAYOUT_COLS, reviewerName: reviewer.name })
    .from(payoutRequests)
    .leftJoin(reviewer, eq(payoutRequests.reviewedBy, reviewer.id))
    .where(eq(payoutRequests.userId, userId))
    .orderBy(desc(payoutRequests.createdAt));
};

export const getAllPayoutRequests = async (): Promise<PayoutRequestWithUser[]> => {
  const reviewer = alias(users, "reviewer");
  return db
    .select({ ...PAYOUT_COLS, userName: users.name, reviewerName: reviewer.name })
    .from(payoutRequests)
    .innerJoin(users, eq(payoutRequests.userId, users.id))
    .leftJoin(reviewer, eq(payoutRequests.reviewedBy, reviewer.id))
    .orderBy(desc(payoutRequests.createdAt));
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

export const approvePayoutRequest = async (
  id: string,
  reviewerId: string,
  txHash?: string
): Promise<void> => {
  // neon-http doesn't support transactions — use conditional update for idempotency
  const [request] = await db
    .update(payoutRequests)
    .set({ status: "approved", reviewedBy: reviewerId, reviewedAt: new Date(), txHash: txHash ?? null })
    .where(and(eq(payoutRequests.id, id), eq(payoutRequests.status, "pending")))
    .returning();

  if (!request) return; // already approved or rejected — skip

  await db.insert(transactions).values({
    userId: request.userId,
    type: "PAYOUT",
    amount: request.amount,
    status: "confirmed",
    txHash: txHash ?? null,
    notes: `Payout approved`,
  });
};

export const rejectPayoutRequest = async (id: string, reviewerId: string): Promise<void> => {
  await db
    .update(payoutRequests)
    .set({ status: "rejected", reviewedBy: reviewerId, reviewedAt: new Date() })
    .where(eq(payoutRequests.id, id));
};
