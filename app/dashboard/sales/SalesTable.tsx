"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { useTransactions } from "@/features/transactions/hooks";
import { Table, type Column } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { formatUsd } from "@/lib/exchange";
import { formatAddress } from "@/lib/utils";
import type { TransactionFilters } from "@/db/queries/transactions";
import type { TransactionWithBuyerName } from "@/db/schema/transactions";

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

const COLUMNS: Column<TransactionWithBuyerName>[] = [
  { header: "Type", key: "type", render: (row) => <StatusBadge status={row.type} /> },
  {
    header: "Customer",
    key: "buyerName",
    render: (row) => (
      <span className="text-sm text-foreground">{row.buyerName ?? "—"}</span>
    ),
  },
  { header: "Amount", key: "amount", render: (row) => <span className="font-medium">{formatUsd(row.amount)}</span> },
  {
    header: "Wallet",
    key: "wallet",
    render: (row) => (
      <span className="text-muted font-mono text-xs">
        {row.buyerWallet ? formatAddress(row.buyerWallet) : "—"}
      </span>
    ),
  },
  {
    header: "Date",
    key: "date",
    render: (row) => (
      <span className="text-muted">
        {new Date(row.createdAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
      </span>
    ),
  },
  { header: "Status", key: "status", render: (row) => <StatusBadge status={row.status} /> },
];

function exportCsv(data: TransactionWithBuyerName[]) {
  const headers = ["ID", "Type", "Customer", "Amount", "Wallet", "Date", "Status"];
  const rows = data.map((t) => [
    t.id,
    t.type,
    t.buyerName ?? "",
    t.amount,
    t.buyerWallet ?? "",
    new Date(t.createdAt).toISOString(),
    t.status,
  ]);
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((r) => r.map(esc).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function SalesTable() {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const { data = [], isLoading, isError } = useTransactions(filters);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-2 sm:gap-3">
        <input
          type="date"
          className="h-10 flex-1 min-w-32.5 rounded-lg border border-card-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value ? new Date(e.target.value) : undefined }))}
        />
        <input
          type="date"
          className="h-10 flex-1 min-w-32.5 rounded-lg border border-card-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value ? new Date(e.target.value) : undefined }))}
        />
        <Select
          value={filters.type ?? "ALL"}
          onValueChange={(v) => setFilters((f) => ({ ...f, type: v === "ALL" ? undefined : v as TransactionFilters["type"] }))}
          options={TYPE_OPTIONS}
          placeholder="All Types"
        />
        <Select
          value={filters.status ?? "ALL"}
          onValueChange={(v) => setFilters((f) => ({ ...f, status: v === "ALL" ? undefined : v as TransactionFilters["status"] }))}
          options={STATUS_OPTIONS}
          placeholder="All Statuses"
        />
        <Button variant="outline" size="sm" onClick={() => exportCsv(data)} disabled={data.length === 0}>
          <Download className="h-4 w-4" />
          <span className="hidden xs:inline">Export CSV</span>
          <span className="xs:hidden">Export</span>
        </Button>
      </div>
      {isLoading ? (
        <p className="text-muted text-sm">Loading...</p>
      ) : isError ? (
        <p className="text-danger text-sm">Failed to load transactions. Please refresh.</p>
      ) : (
        <Table data={data} columns={COLUMNS} keyExtractor={(r) => r.id} emptyMessage="No transactions found." />
      )}
    </div>
  );
}
