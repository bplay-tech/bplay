"use client";

import Link from "next/link";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import { LocalDate } from "@/components/ui/LocalDate";
import { cn } from "@/lib/utils";
import type { BplayPurchaseWithUser } from "@/db/queries/bplay-purchases";

type Filter = "confirmed" | "declined";

interface PurchasesClientProps {
  purchases: BplayPurchaseWithUser[];
  total: number;
  page: number;
  pageSize: number;
  activeFilter: Filter;
  confirmedTotal: number;
  declinedTotal: number;
}

const COLUMNS: Column<BplayPurchaseWithUser>[] = [
  { header: "Buyer", key: "buyer", render: (r) => <span className="text-sm font-medium">{r.userName}</span> },
  { header: "Wallet", key: "wallet", render: (r) => <span className="font-mono text-xs text-muted">{r.buyerWallet.slice(0, 12)}…</span> },
  { header: "USDC", key: "usdc", render: (r) => <span className="font-medium">${parseFloat(r.usdcAmount).toFixed(2)}</span> },
  { header: "BPLAY", key: "bplay", render: (r) => <span>{parseFloat(r.bplayAmount).toLocaleString()}</span> },
  { header: "Rate", key: "rate", render: (r) => <span className="text-muted text-xs">{parseFloat(r.exchangeRate).toFixed(4)}</span> },
  {
    header: "Tx Hash",
    key: "txHash",
    render: (r) =>
      r.txHash ? (
        <a
          href={`https://etherscan.io/tx/${r.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-primary text-xs hover:underline"
        >
          {r.txHash.slice(0, 10)}… <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <span className="text-muted">—</span>
      ),
  },
  {
    header: "Date",
    key: "date",
    render: (r) => (
      <span className="text-muted text-xs">
        <LocalDate iso={r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt} showTime />
      </span>
    ),
  },
  { header: "Status", key: "status", render: (r) => <StatusBadge status={r.status} /> },
];

const FILTERS: { label: string; value: Filter }[] = [
  { label: "Confirmed", value: "confirmed" },
  { label: "Declined", value: "declined" },
];

function pageHref(status: Filter, p: number) {
  return `/dashboard/purchases?status=${status}&page=${p}`;
}

export function PurchasesClient({
  purchases,
  total,
  page,
  pageSize,
  activeFilter,
  confirmedTotal,
  declinedTotal,
}: PurchasesClientProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const counts: Record<Filter, number> = { confirmed: confirmedTotal, declined: declinedTotal };

  return (
    <div className="flex flex-col gap-4">
      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {FILTERS.map(({ label, value }) => (
          <Link
            key={value}
            href={pageHref(value, 1)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeFilter === value
                ? "bg-primary text-white shadow-[0_0_16px_rgba(124,92,255,0.3)]"
                : "text-muted hover:text-foreground hover:bg-white/5 border border-white/10"
            )}
          >
            {label}
            <span
              className={cn(
                "text-xs px-1.5 py-0.5 rounded-full font-semibold",
                activeFilter === value ? "bg-white/20 text-white" : "bg-white/10 text-muted"
              )}
            >
              {counts[value]}
            </span>
          </Link>
        ))}
      </div>

      {/* Table — always receives ≤10 rows so internal pagination never triggers */}
      <Table
        data={purchases}
        columns={COLUMNS}
        keyExtractor={(r) => r.id}
        emptyMessage={activeFilter === "confirmed" ? "No confirmed purchases yet." : "No declined purchases."}
      />

      {/* Server-side pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted">
          <span>
            Page {page} of {totalPages}&nbsp;·&nbsp;{total} total
          </span>
          <div className="flex gap-1">
            <Link
              href={pageHref(activeFilter, page - 1)}
              aria-disabled={page === 1}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                page === 1 ? "opacity-40 pointer-events-none" : "hover:bg-white/5"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <Link
              href={pageHref(activeFilter, page + 1)}
              aria-disabled={page === totalPages}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                page === totalPages ? "opacity-40 pointer-events-none" : "hover:bg-white/5"
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
