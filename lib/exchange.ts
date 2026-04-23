import { getCurrentExchangeRate } from "@/db/queries/exchange-rates";
import type { ExchangeRate } from "@/db/schema/exchange-rates";

export const getExchangeRate = async (): Promise<ExchangeRate> => {
  const rate = await getCurrentExchangeRate();
  if (!rate) throw new Error("No exchange rate configured");
  return rate;
};

export const QUICK_BUY_AMOUNTS = [10, 50, 100, 500] as const;

export const usdcToBplay = (usdc: number, rate: number): number => usdc * rate;

export const formatUsd = (val: string | number): string =>
  `$${parseFloat(String(val)).toFixed(2)}`;

export const formatBplay = (val: string | number): string =>
  `${parseFloat(String(val)).toLocaleString()} BPLAY`;
