"use client";

import { useQuery } from "@tanstack/react-query";
import type { TransactionFilters } from "@/db/queries/transactions";
import type { TransactionWithBuyerName } from "@/db/schema/transactions";

function buildParams(filters: TransactionFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.from) p.set("from", filters.from.toISOString());
  if (filters.to) p.set("to", filters.to.toISOString());
  if (filters.type) p.set("type", filters.type);
  if (filters.status) p.set("status", filters.status);
  return p;
}

export const useTransactions = (filters: TransactionFilters) =>
  useQuery({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      const r = await fetch(`/api/transactions?${buildParams(filters)}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json() as Promise<TransactionWithBuyerName[]>;
    },
    retry: 1,
  });
