import { eq, and, sum, inArray, sql, asc } from "drizzle-orm";
import { db } from "../client";
import { bplayPurchases, type BplayPurchase, type NewBplayPurchase } from "../schema/bplay-purchases";
import { users } from "../schema/users";
import { affiliations } from "../schema/affiliations";

export type BplayPurchaseWithUser = BplayPurchase & { userName: string };

export const getBplayPurchasesByUser = async (userId: string): Promise<BplayPurchase[]> => {
  return db.select().from(bplayPurchases).where(eq(bplayPurchases.userId, userId));
};

export const getAllPendingPurchases = async (): Promise<BplayPurchaseWithUser[]> => {
  return db
    .select({
      id: bplayPurchases.id,
      userId: bplayPurchases.userId,
      usdcAmount: bplayPurchases.usdcAmount,
      bplayAmount: bplayPurchases.bplayAmount,
      exchangeRate: bplayPurchases.exchangeRate,
      buyerWallet: bplayPurchases.buyerWallet,
      recipientAddress: bplayPurchases.recipientAddress,
      txHash: bplayPurchases.txHash,
      status: bplayPurchases.status,
      approvedBy: bplayPurchases.approvedBy,
      approvedAt: bplayPurchases.approvedAt,
      createdAt: bplayPurchases.createdAt,
      userName: users.name,
    })
    .from(bplayPurchases)
    .innerJoin(users, eq(bplayPurchases.userId, users.id))
    .where(eq(bplayPurchases.status, "pending_payment"));
};

export const createBplayPurchase = async (data: NewBplayPurchase): Promise<BplayPurchase> => {
  const result = await db.insert(bplayPurchases).values(data).returning();
  return result[0];
};

export const updateBplayPurchaseTxHash = async (id: string, txHash: string): Promise<void> => {
  await db
    .update(bplayPurchases)
    .set({ txHash, status: "payment_confirmed" })
    .where(eq(bplayPurchases.id, id));
};

export const getBplayPurchaseById = async (id: string): Promise<BplayPurchase | null> => {
  const result = await db.select().from(bplayPurchases).where(eq(bplayPurchases.id, id)).limit(1);
  return result[0] ?? null;
};

export const getPurchaseByTxHash = async (txHash: string): Promise<BplayPurchase | null> => {
  const result = await db
    .select()
    .from(bplayPurchases)
    .where(eq(bplayPurchases.txHash, txHash))
    .limit(1);
  return result[0] ?? null;
};

export const approveBplayPurchase = async (id: string, approvedBy: string): Promise<void> => {
  await db
    .update(bplayPurchases)
    .set({ status: "tokens_transferred", approvedBy, approvedAt: new Date() })
    .where(eq(bplayPurchases.id, id));
};

export const rejectBplayPurchase = async (id: string): Promise<void> => {
  await db.update(bplayPurchases).set({ status: "failed" }).where(eq(bplayPurchases.id, id));
};

export const getBplayBalance = async (userId: string): Promise<number> => {
  const result = await db
    .select({ total: sum(bplayPurchases.bplayAmount) })
    .from(bplayPurchases)
    .where(
      and(eq(bplayPurchases.userId, userId), eq(bplayPurchases.status, "tokens_transferred"))
    );
  return parseFloat(result[0]?.total ?? "0");
};

export const getTeamTokensSold = async (
  affiliateId: string
): Promise<{ totalBplay: number; totalUsdc: number }> => {
  const referred = await db
    .select({ referredUserId: affiliations.referredUserId })
    .from(affiliations)
    .where(eq(affiliations.affiliateId, affiliateId));

  if (referred.length === 0) return { totalBplay: 0, totalUsdc: 0 };

  const ids = referred.map((r) => r.referredUserId);
  const result = await db
    .select({
      totalBplay: sum(bplayPurchases.bplayAmount),
      totalUsdc: sum(bplayPurchases.usdcAmount),
    })
    .from(bplayPurchases)
    .where(and(inArray(bplayPurchases.userId, ids), eq(bplayPurchases.status, "tokens_transferred")));

  return {
    totalBplay: parseFloat(result[0]?.totalBplay ?? "0"),
    totalUsdc: parseFloat(result[0]?.totalUsdc ?? "0"),
  };
};

export type TokenDataPoint = { date: string; bplay: number; cumulative: number };

export const getTokenPurchaseHistory = async (userId: string): Promise<TokenDataPoint[]> => {
  const rows = await db
    .select({
      date: sql<string>`to_char(${bplayPurchases.createdAt}, 'YYYY-MM-DD')`,
      bplay: bplayPurchases.bplayAmount,
    })
    .from(bplayPurchases)
    .where(and(eq(bplayPurchases.userId, userId), eq(bplayPurchases.status, "tokens_transferred")))
    .orderBy(asc(bplayPurchases.createdAt));

  let cumulative = 0;
  return rows.map((row) => {
    const amount = parseFloat(row.bplay ?? "0");
    cumulative += amount;
    return { date: row.date, bplay: amount, cumulative };
  });
};
