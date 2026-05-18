import { unstable_noStore as noStore } from "next/cache";
import { desc } from "drizzle-orm";
import { db } from "../client";
import { exchangeRates, type ExchangeRate, type NewExchangeRate } from "../schema";

export const getCurrentExchangeRate = async (): Promise<ExchangeRate | null> => {
  noStore();
  const result = await db
    .select()
    .from(exchangeRates)
    .orderBy(desc(exchangeRates.updatedAt))
    .limit(1);
  return result[0] ?? null;
};

export const insertExchangeRate = async (data: NewExchangeRate): Promise<ExchangeRate> => {
  const result = await db.insert(exchangeRates).values(data).returning();
  return result[0];
};
