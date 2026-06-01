import { getCurrentExchangeRate } from "@/db/queries/exchange-rates";
import type { ExchangeRate } from "@/db/schema/exchange-rates";

export const getExchangeRate = async (): Promise<ExchangeRate> => {
  const rate = await getCurrentExchangeRate();
  if (!rate) throw new Error("No exchange rate configured");
  return rate;
};

export const QUICK_BUY_AMOUNTS = [100, 500, 2000, 10000] as const;

// Short form for tight layouts: 100 -> "100", 2000 -> "2k", 10000 -> "10k".
export const formatUsdShort = (value: number): string => {
  if (value >= 1000) {
    const k = value / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(1)}k`;
  }
  return String(value);
};

export const usdcToBplay = (usdc: number, rate: number): number => usdc * rate;

export const formatUsd = (val: string | number): string =>
  `$${parseFloat(String(val)).toFixed(2)}`;

export const formatBplay = (val: string | number): string =>
  `${parseFloat(String(val)).toLocaleString()} BPLAY`;

// Short form for tight layouts: 3125 -> "3.1k BPLAY", 312500 -> "312.5k BPLAY".
export const formatBplayShort = (val: string | number): string => {
  const value = parseFloat(String(val));
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `${Number.isInteger(m) ? m : m.toFixed(1)}M BPLAY`;
  }
  if (value >= 1_000) {
    const k = value / 1_000;
    return `${Number.isInteger(k) ? k : k.toFixed(1)}k BPLAY`;
  }
  return `${value.toLocaleString()} BPLAY`;
};
