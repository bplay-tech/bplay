"use client";

import { useState } from "react";
import {
  Download, ArrowDownLeft, ArrowUpRight, Users,
  ChevronLeft, ChevronRight, Calendar, AlertCircle, Hash,
  TrendingUp, Wallet,
} from "lucide-react";
import { useTransactions } from "@/features/transactions/hooks";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { formatUsd } from "@/lib/exchange";
import { formatAddress } from "@/lib/utils";
import type { TransactionFilters } from "@/db/queries/transactions";
import type { TransactionWithBuyerName } from "@/db/schema/transactions";

const PAGE_SIZE = 20;

const TYPE_OPTIONS = [
  { value: "ALL", label: "All Types" },
  { value: "SALE", label: "Sale" },
  { value: "REFERRAL", label: "Referral" },
  { value: "PAYOUT", label: "Payout" },
];

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "failed", label: "Failed" },
];

const TYPE_CONFIG = {
  REFERRAL: {
    icon: <ArrowDownLeft className="h-3.5 w-3.5" />,
    color: "#a78bfa",
    bg: "rgba(124,92,255,0.1)",
    border: "rgba(124,92,255,0.25)",
    accent: "#7c5cff",
    label: "Referral Commission",
  },
  SALE: {
    icon: <ArrowDownLeft className="h-3.5 w-3.5" />,
    color: "#4ade80",
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.25)",
    accent: "#16a34a",
    label: "Direct Sale",
  },
  PAYOUT: {
    icon: <ArrowUpRight className="h-3.5 w-3.5" />,
    color: "#60a5fa",
    bg: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.25)",
    accent: "#2563eb",
    label: "Commission Payout",
  },
} as const;

/* ------------------------------------------------------------------ */
/*  Commission note parsers                                             */
/* ------------------------------------------------------------------ */

function parseRegularNote(notes: string) {
  const rate = notes.match(/^([\d.]+)%/)?.[1];
  const amount = notes.match(/\$([\d.]+) purchase/)?.[1];
  const tier = notes.match(/\((\w+) tier\)/)?.[1];
  return { rate, amount, tier };
}

function parseDiffNote(notes: string) {
  const diffRate = notes.match(/^([\d.]+)%/)?.[1];
  const adminTier = notes.match(/\((\w+) ([\d.]+)% /)?.[1];
  const adminRate = notes.match(/\((\w+) ([\d.]+)% /)?.[2];
  const salesTier = notes.match(/− (\w+) ([\d.]+)%\)/)?.[1];
  const salesRate = notes.match(/− (\w+) ([\d.]+)%\)/)?.[2];
  const amount = notes.match(/on \$([\d.]+) purchase/)?.[1];
  const viaRaw = notes.match(/purchase via (.+)$/)?.[1] ?? null;
  const adminName = viaRaw?.match(/· admin: (.+)$/)?.[1] ?? null;
  const viaName = viaRaw?.replace(/· admin: .+$/, "").trim() ?? null;
  return { diffRate, adminTier, adminRate, salesTier, salesRate, amount, viaName, adminName };
}

/* ------------------------------------------------------------------ */
/*  CommissionNotes                                                     */
/* ------------------------------------------------------------------ */

function CommissionNotes({ notes, type }: { notes: string | null; type: string }) {
  if (!notes || type === "PAYOUT") return null;

  const isDiff = notes.includes("commission diff");
  const isRegular = notes.includes("commission on") && !isDiff;

  if (isDiff) {
    const { diffRate, adminTier, adminRate, salesTier, salesRate, amount, viaName, adminName } = parseDiffNote(notes);
    return (
      <div
        className="mt-2 flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
        style={{ background: "rgba(124,92,255,0.08)", border: "1px solid rgba(124,92,255,0.18)" }}
      >
        <Users className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: "#a78bfa" }} />
        <div className="flex flex-col gap-1.5 min-w-0">
          <span className="text-[11px] font-semibold" style={{ color: "#c4b5fd" }}>
            Commission Differential
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="text-[11px] font-mono px-1.5 py-0.5 rounded-md font-medium"
              style={{ background: "rgba(185,242,255,0.1)", color: "#B9F2FF", border: "1px solid rgba(185,242,255,0.2)" }}
            >
              {adminTier} {adminRate}%
            </span>
            <span className="text-[11px] text-white/30">−</span>
            <span
              className="text-[11px] font-mono px-1.5 py-0.5 rounded-md font-medium"
              style={{ background: "rgba(205,127,50,0.1)", color: "#e8a87c", border: "1px solid rgba(205,127,50,0.2)" }}
            >
              {salesTier} {salesRate}%
            </span>
            <span className="text-[11px] text-white/30">=</span>
            <span
              className="text-[11px] font-mono px-1.5 py-0.5 rounded-md font-bold"
              style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.25)" }}
            >
              {diffRate}% earned
            </span>
            {amount && <span className="text-[11px] text-white/25">on ${amount} purchase</span>}
          </div>
          {(viaName || adminName) && (
            <div className="flex items-center gap-3 flex-wrap">
              {viaName && (
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                  via <span style={{ color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>{viaName}</span>
                </span>
              )}
              {adminName && (
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                  admin <span style={{ color: "#c4b5fd", fontWeight: 500 }}>{adminName}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isRegular) {
    const { rate, amount, tier } = parseRegularNote(notes);
    return (
      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
        {rate && (
          <span
            className="text-[11px] font-mono px-2 py-0.5 rounded-md font-semibold"
            style={{ background: "rgba(74,222,128,0.08)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.18)" }}
          >
            {rate}% rate
          </span>
        )}
        {tier && <span className="text-[11px] text-white/35">{tier} tier</span>}
        {amount && <span className="text-[11px] text-white/25">on ${amount} purchase</span>}
      </div>
    );
  }

  return <p className="text-[11px] mt-1 text-white/30">{notes}</p>;
}

/* ------------------------------------------------------------------ */
/*  TransactionRow                                                      */
/* ------------------------------------------------------------------ */

function formatDateTime(d: Date | string) {
  const dt = new Date(d);
  return {
    date: dt.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }),
    time: dt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
  };
}

function TransactionRow({ tx }: { tx: TransactionWithBuyerName }) {
  const config = TYPE_CONFIG[tx.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.SALE;
  const isPayout = tx.type === "PAYOUT";
  const { date, time } = formatDateTime(tx.createdAt);

  return (
    <div
      className="relative flex flex-col sm:flex-row gap-4 py-4 px-5 border-b last:border-0 transition-colors"
      style={{ borderColor: "rgba(255,255,255,0.045)" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.018)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      {/* Left accent */}
      <div
        className="absolute left-0 top-3 bottom-3 w-0.75 rounded-full"
        style={{ background: config.accent }}
      />

      {/* Icon + info */}
      <div className="flex items-start gap-3 flex-1 min-w-0 pl-3">
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: config.bg, color: config.color, border: `1px solid ${config.border}` }}
        >
          {config.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold" style={{ color: config.color }}>
              {config.label}
            </span>
            <StatusBadge status={tx.status} />
          </div>

          <CommissionNotes notes={tx.notes} type={tx.type} />

          {(tx.buyerName || tx.buyerWallet) && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {tx.buyerName && (
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {isPayout ? "to" : "from"}{" "}
                  <span style={{ color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>{tx.buyerName}</span>
                </span>
              )}
              {tx.buyerWallet && (
                <span className="flex items-center gap-1 text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
                  <Wallet className="h-2.5 w-2.5" />
                  {formatAddress(tx.buyerWallet)}
                </span>
              )}
            </div>
          )}

          {tx.txHash && (
            <div className="flex items-center gap-1 mt-1">
              <Hash className="h-2.5 w-2.5" style={{ color: "rgba(255,255,255,0.15)" }} />
              <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.15)" }}>
                {tx.txHash.slice(0, 22)}…
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Amount + date */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 shrink-0 pl-13 sm:pl-0">
        <p className="text-base font-bold tabular-nums" style={{ color: config.color }}>
          {isPayout ? "−" : "+"}{formatUsd(tx.amount)}
        </p>
        <div className="flex sm:flex-col sm:items-end gap-1.5 sm:gap-0.5">
          <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>{date}</span>
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>{time}</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pagination                                                          */
/* ------------------------------------------------------------------ */

function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, "…", totalPages];
    if (page >= totalPages - 3) return [1, "…", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "…", page - 1, page, page + 1, "…", totalPages];
  })();

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4">
      <span className="text-xs order-2 sm:order-1" style={{ color: "rgba(255,255,255,0.25)" }}>
        Showing {start}–{end} of {total} transaction{total !== 1 ? "s" : ""}
      </span>
      <div className="flex items-center gap-1 order-1 sm:order-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="h-8 w-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`el-${i}`} className="w-8 text-center text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className="h-8 w-8 text-xs font-medium rounded-lg transition-all"
              style={
                p === page
                  ? { background: "rgba(124,92,255,0.35)", border: "1px solid rgba(124,92,255,0.5)", color: "#c4b5fd" }
                  : { background: "transparent", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }
              }
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="h-8 w-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CSV export                                                          */
/* ------------------------------------------------------------------ */

function exportCsv(data: TransactionWithBuyerName[]) {
  const headers = ["ID", "Type", "Customer", "Amount (USD)", "Wallet", "Date", "Status", "Notes"];
  const rows = data.map((t) => [
    t.id, t.type, t.buyerName ?? "", t.amount,
    t.buyerWallet ?? "", new Date(t.createdAt).toISOString(), t.status, t.notes ?? "",
  ]);
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((r) => r.map(esc).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/*  SalesTable                                                          */
/* ------------------------------------------------------------------ */

export function SalesTable() {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [page, setPage] = useState(1);

  const setFilter = <K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const { data: result, isLoading, isError, isFetching } = useTransactions(filters, page, PAGE_SIZE);
  const txns = result?.data ?? [];
  const total = result?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const referralCount = txns.filter((t) => t.type === "REFERRAL").length;
  const saleCount = txns.filter((t) => t.type === "SALE").length;
  const payoutCount = txns.filter((t) => t.type === "PAYOUT").length;

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-2 sm:gap-2.5">
        <div className="relative flex-1 min-w-32">
          <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: "rgba(255,255,255,0.2)" }} />
          <input
            type="date"
            className="h-10 w-full rounded-lg border border-card-border bg-card pl-8 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            onChange={(e) => setFilter("from", e.target.value ? new Date(e.target.value) : undefined)}
          />
        </div>
        <div className="relative flex-1 min-w-32">
          <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: "rgba(255,255,255,0.2)" }} />
          <input
            type="date"
            className="h-10 w-full rounded-lg border border-card-border bg-card pl-8 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            onChange={(e) => setFilter("to", e.target.value ? new Date(e.target.value) : undefined)}
          />
        </div>
        <Select
          value={filters.type ?? "ALL"}
          onValueChange={(v) => setFilter("type", v === "ALL" ? undefined : v as TransactionFilters["type"])}
          options={TYPE_OPTIONS}
          placeholder="All Types"
        />
        <Select
          value={filters.status ?? "ALL"}
          onValueChange={(v) => setFilter("status", v === "ALL" ? undefined : v as TransactionFilters["status"])}
          options={STATUS_OPTIONS}
          placeholder="All Statuses"
        />
        <Button variant="outline" size="sm" onClick={() => exportCsv(txns)} disabled={txns.length === 0}>
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export CSV</span>
        </Button>
      </div>

      {/* Ledger card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#0f1520", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Ledger header */}
        <div
          className="flex items-center justify-between gap-4 px-5 py-3 flex-wrap"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5" style={{ color: "rgba(255,255,255,0.3)" }} />
            <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>
              Commission Ledger
            </span>
            {isFetching && !isLoading && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(124,92,255,0.15)", color: "#a78bfa" }}>
                updating…
              </span>
            )}
          </div>

          {!isLoading && !isError && total > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                {total} total
              </span>
              {referralCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{referralCount} referral{referralCount !== 1 ? "s" : ""}</span>
                </div>
              )}
              {saleCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{saleCount} sale{saleCount !== 1 ? "s" : ""}</span>
                </div>
              )}
              {payoutCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{payoutCount} payout{payoutCount !== 1 ? "s" : ""}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="flex flex-col gap-0">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="relative flex items-start gap-3 px-5 py-4 border-b last:border-0 animate-pulse"
                style={{ borderColor: "rgba(255,255,255,0.045)" }}
              >
                <div className="absolute left-0 top-3 bottom-3 w-0.75 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }} />
                <div className="h-9 w-9 rounded-xl shrink-0 ml-3" style={{ background: "rgba(255,255,255,0.05)" }} />
                <div className="flex-1 flex flex-col gap-2 pt-1">
                  <div className="h-3 w-32 rounded" style={{ background: "rgba(255,255,255,0.05)" }} />
                  <div className="h-2.5 w-48 rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
                  <div className="h-2 w-24 rounded" style={{ background: "rgba(255,255,255,0.03)" }} />
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="h-4 w-16 rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
                  <div className="h-2.5 w-20 rounded" style={{ background: "rgba(255,255,255,0.03)" }} />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 py-12 justify-center" style={{ color: "rgba(248,113,113,0.8)" }}>
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Failed to load transactions. Please refresh.</span>
          </div>
        ) : txns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2">
            <TrendingUp className="h-8 w-8" style={{ color: "rgba(255,255,255,0.1)" }} />
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>No transactions found.</p>
            {(filters.type || filters.status || filters.from || filters.to) && (
              <button
                className="text-xs mt-1 underline"
                style={{ color: "rgba(167,139,250,0.6)" }}
                onClick={() => { setFilters({}); setPage(1); }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div>
              {txns.map((tx) => <TransactionRow key={tx.id} tx={tx} />)}
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
