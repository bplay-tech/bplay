"use client";

import { useQuery } from "@tanstack/react-query";
import type { TransactionFilters, PaginatedResult } from "@/db/queries/transactions";
import type { TransactionWithBuyerName } from "@/db/schema/transactions";

export type { PaginatedResult };

function buildParams(filters: TransactionFilters, page: number, pageSize: number): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.from) p.set("from", filters.from.toISOString());
  if (filters.to) p.set("to", filters.to.toISOString());
  if (filters.type) p.set("type", filters.type);
  if (filters.status) p.set("status", filters.status);
  p.set("page", String(page));
  p.set("pageSize", String(pageSize));
  return p;
}

export const useTransactions = (filters: TransactionFilters, page = 1, pageSize = 20) =>
  useQuery({
    queryKey: ["transactions", filters, page, pageSize],
    queryFn: async () => {
      const r = await fetch(`/api/transactions?${buildParams(filters, page, pageSize)}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json() as Promise<PaginatedResult<TransactionWithBuyerName>>;
    },
    placeholderData: (prev) => prev,
    retry: 1,
  });
