import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getAddress } from "viem";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatAddress = (addr: string) =>
  `${addr.slice(0, 6)}...${addr.slice(-4)}`;

export const checksumAddress = (addr: string) => getAddress(addr.toLowerCase());

export const formatAmount = (amount: bigint, decimals = 18) => {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  const fractionStr = fraction.toString().padStart(decimals, "0").slice(0, 4);
  return `${whole}.${fractionStr}`;
};
