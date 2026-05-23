import { eq, and, gte, lte, sum, count, inArray, sql, SQL, desc } from "drizzle-orm";
import { db } from "../client";
import { transactions, type Transaction, type TransactionWithBuyerName, type NewTransaction } from "../schema/transactions";
import { affiliations } from "../schema/affiliations";
import { users } from "../schema/users";
import { payoutRequests } from "../schema/payout-requests";

export type TransactionFilters = {
  from?: Date;
  to?: Date;
  type?: "SALE" | "PAYOUT" | "REFERRAL";
  status?: "pending" | "confirmed" | "failed";
};

export type { TransactionWithBuyerName };
export type TransactionWithUser = Transaction & { buyerName: string | null; userName: string };

// Correlated subquery — looks up the buyer name via the shared tx_hash
const buyerNameCol = sql<string | null>`(
  SELECT u.name
  FROM bplay_purchases bp
  INNER JOIN users u ON bp.user_id = u.id
  WHERE bp.tx_hash = transactions.tx_hash
  LIMIT 1
)`;

const txCols = {
  id: transactions.id,
  userId: transactions.userId,
  type: transactions.type,
  amount: transactions.amount,
  buyerWallet: transactions.buyerWallet,
  txHash: transactions.txHash,
  status: transactions.status,
  notes: transactions.notes,
  createdAt: transactions.createdAt,
  buyerName: buyerNameCol,
};

function buildWhereConditions(filters?: TransactionFilters): SQL[] {
  const conditions: SQL[] = [];
  if (filters?.from) conditions.push(gte(transactions.createdAt, filters.from));
  if (filters?.to) conditions.push(lte(transactions.createdAt, filters.to));
  if (filters?.type) conditions.push(eq(transactions.type, filters.type));
  if (filters?.status) conditions.push(eq(transactions.status, filters.status));
  return conditions;
}

export const getTransactionsByUser = async (
  userId: string,
  filters?: TransactionFilters
): Promise<TransactionWithBuyerName[]> => {
  const conditions = [eq(transactions.userId, userId), ...buildWhereConditions(filters)];
  return db.select(txCols).from(transactions).where(and(...conditions));
};

export const getAllTransactions = async (
  filters?: TransactionFilters
): Promise<TransactionWithUser[]> => {
  const conditions = buildWhereConditions(filters);
  const query = db
    .select({ ...txCols, userName: users.name })
    .from(transactions)
    .innerJoin(users, eq(transactions.userId, users.id));

  if (conditions.length > 0) {
    return query.where(and(...conditions));
  }
  return query;
};

export const getTeamTransactions = async (
  affiliateId: string,
  filters?: TransactionFilters
): Promise<TransactionWithBuyerName[]> => {
  const referredUsers = await db
    .select({ referredUserId: affiliations.referredUserId })
    .from(affiliations)
    .where(eq(affiliations.affiliateId, affiliateId));

  const referredIds = referredUsers.map((r) => r.referredUserId);
  if (referredIds.length === 0) return [];

  const conditions = [inArray(transactions.userId, referredIds), ...buildWhereConditions(filters)];
  return db.select(txCols).from(transactions).where(and(...conditions));
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

const DEFAULT_PAGE_SIZE = 20;

export const getPaginatedTransactionsByUser = async (
  userId: string,
  filters?: TransactionFilters,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<PaginatedResult<TransactionWithBuyerName>> => {
  const clampedPage = Math.max(1, page);
  const clampedSize = Math.min(100, Math.max(1, pageSize));
  const offset = (clampedPage - 1) * clampedSize;
  const conditions = [eq(transactions.userId, userId), ...buildWhereConditions(filters)];
  const whereClause = and(...conditions);

  const [data, totalRows] = await Promise.all([
    db.select(txCols).from(transactions)
      .where(whereClause)
      .orderBy(desc(transactions.createdAt))
      .limit(clampedSize)
      .offset(offset),
    db.select({ value: count() }).from(transactions).where(whereClause),
  ]);

  return { data, total: Number(totalRows[0]?.value ?? 0), page: clampedPage, pageSize: clampedSize };
};

export const getPaginatedAllTransactions = async (
  filters?: TransactionFilters,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<PaginatedResult<TransactionWithBuyerName>> => {
  const clampedPage = Math.max(1, page);
  const clampedSize = Math.min(100, Math.max(1, pageSize));
  const offset = (clampedPage - 1) * clampedSize;
  const conditions = buildWhereConditions(filters);
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, totalRows] = await Promise.all([
    db.select(txCols).from(transactions)
      .where(whereClause)
      .orderBy(desc(transactions.createdAt))
      .limit(clampedSize)
      .offset(offset),
    db.select({ value: count() }).from(transactions).where(whereClause),
  ]);

  return { data, total: Number(totalRows[0]?.value ?? 0), page: clampedPage, pageSize: clampedSize };
};

export const createTransaction = async (data: NewTransaction): Promise<Transaction> => {
  const result = await db.insert(transactions).values(data).returning();
  return result[0];
};

export const getDashboardStats = async (
  userId: string
): Promise<{ totalEarnings: number; pendingAmount: number; totalSales: number }> => {
  const [earningsResult, pendingResult, salesResult] = await Promise.all([
    db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          inArray(transactions.type, ["SALE", "REFERRAL"]),
          eq(transactions.status, "confirmed")
        )
      ),
    db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.status, "pending"))),
    db
      .select({ total: count() })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, "SALE"),
          eq(transactions.status, "confirmed")
        )
      ),
  ]);

  return {
    totalEarnings: parseFloat(earningsResult[0]?.total ?? "0"),
    pendingAmount: parseFloat(pendingResult[0]?.total ?? "0"),
    totalSales: earningsResult[0]?.total != null ? salesResult[0]?.total ?? 0 : 0,
  };
};

export const getAvailableBalance = async (userId: string): Promise<number> => {
  const [earned, paid, onHold] = await Promise.all([
    db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          inArray(transactions.type, ["SALE", "REFERRAL"]),
          eq(transactions.status, "confirmed")
        )
      ),
    db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, "PAYOUT"),
          eq(transactions.status, "confirmed")
        )
      ),
    db
      .select({ total: sum(payoutRequests.amount) })
      .from(payoutRequests)
      .where(
        and(
          eq(payoutRequests.userId, userId),
          eq(payoutRequests.status, "pending")
        )
      ),
  ]);

  const totalEarned = parseFloat(earned[0]?.total ?? "0");
  const totalPaid = parseFloat(paid[0]?.total ?? "0");
  const totalOnHold = parseFloat(onHold[0]?.total ?? "0");
  return Math.max(0, totalEarned - totalPaid - totalOnHold);
};
