"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { RequestPayoutModal } from "./RequestPayoutModal";
import { ApprovePayoutModal } from "./ApprovePayoutModal";
import { Button } from "@/components/ui/Button";
import { Table, type Column } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { rejectPayoutAction } from "@/features/payouts/actions";
import { formatUsd } from "@/lib/exchange";
import type { PayoutRequest } from "@/db/schema/payout-requests";
import type { PayoutRequestWithUser } from "@/db/queries/payout-requests";

interface PayoutsClientProps {
  availableBalance: number;
  onHold: number;
  history: PayoutRequest[];
  pendingAll?: PayoutRequestWithUser[];
  completedAll?: PayoutRequestWithUser[];
  isSuperAdmin: boolean;
}

function formatLocalDateTime(d: Date | string): string {
  return new Date(d).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
}

const HISTORY_COLUMNS: Column<PayoutRequest>[] = [
  { header: "Amount", key: "amount", render: (r) => <span className="font-medium">{formatUsd(r.amount)}</span> },
  { header: "Date", key: "date", render: (r) => <span className="text-muted">{formatLocalDateTime(r.createdAt)}</span> },
  { header: "Status", key: "status", render: (r) => <StatusBadge status={r.status} /> },
];

const ALL_HISTORY_COLUMNS: Column<PayoutRequestWithUser>[] = [
  { header: "Partner", key: "partner", render: (r) => <span className="font-medium">{r.userName}</span> },
  { header: "Amount", key: "amount", render: (r) => <span className="font-medium">{formatUsd(r.amount)}</span> },
  { header: "Wallet", key: "wallet", render: (r) => <span className="text-muted font-mono text-xs">{r.walletAddress ? r.walletAddress.slice(0, 14) + "…" : "—"}</span> },
  { header: "Date", key: "date", render: (r) => <span className="text-muted">{formatLocalDateTime(r.createdAt)}</span> },
  { header: "Status", key: "status", render: (r) => <StatusBadge status={r.status} /> },
];

function exportHistoryCsv(data: PayoutRequest[] | PayoutRequestWithUser[], includePartner: boolean) {
  const headers = includePartner
    ? ["Partner", "Amount", "Wallet", "Date (UTC)", "Status"]
    : ["Amount", "Wallet", "Date (UTC)", "Status"];

  const rows = data.map((r) => {
    const base = [
      formatUsd(r.amount),
      r.walletAddress ?? "",
      new Date(r.createdAt).toISOString(),
      r.status,
    ];
    return includePartner ? [(r as PayoutRequestWithUser).userName, ...base] : base;
  });

  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((row) => row.map(esc).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "payout-history.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function PayoutsClient({
  availableBalance,
  onHold,
  history,
  pendingAll,
  completedAll,
  isSuperAdmin,
}: PayoutsClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [approving, setApproving] = useState<PayoutRequestWithUser | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleReject = (id: string) => {
    setRejectingId(id);
    startTransition(async () => {
      try {
        await rejectPayoutAction(id);
        toast.success("Payout rejected.");
      } catch {
        toast.error("Failed to reject payout. Please try again.");
      } finally {
        setRejectingId(null);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted">Available Balance</p>
          <p className="text-3xl font-bold text-foreground">{formatUsd(availableBalance)}</p>
          {onHold > 0 && (
            <p className="text-xs text-yellow-500">{formatUsd(onHold)} on hold — pending approval</p>
          )}
        </div>
        <Button onClick={() => setModalOpen(true)} disabled={availableBalance <= 0} className="w-full sm:w-auto">
          Request Payout
        </Button>
      </div>

      <RequestPayoutModal open={modalOpen} onOpenChange={setModalOpen} availableBalance={availableBalance} />
      <ApprovePayoutModal request={approving} onOpenChange={(open) => { if (!open) setApproving(null); }} />

      {isSuperAdmin && pendingAll && pendingAll.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Pending Approvals</h2>
          <div className="overflow-x-auto rounded-xl border border-card-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border bg-card/50">
                  {["Partner", "Amount", "Method", "Wallet", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingAll.map((req) => (
                  <tr key={req.id} className="bg-card hover:bg-card/70 transition-colors border-b border-card-border">
                    <td className="px-4 py-3 text-foreground">{req.userName}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{formatUsd(req.amount)}</td>
                    <td className="px-4 py-3 text-muted">{req.payoutMethod}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {req.walletAddress ? req.walletAddress.slice(0, 16) + "…" : "—"}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="success" onClick={() => setApproving(req)}>
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          loading={rejectingId === req.id}
                          disabled={rejectingId !== null}
                          onClick={() => handleReject(req.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isSuperAdmin && completedAll && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">All Payout History</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportHistoryCsv(completedAll, true)}
              disabled={completedAll.length === 0}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
          <Table
            data={completedAll}
            columns={ALL_HISTORY_COLUMNS}
            keyExtractor={(r) => r.id}
            emptyMessage="No completed payouts yet."
          />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">My Payout History</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportHistoryCsv(history, false)}
            disabled={history.length === 0}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
        <Table data={history} columns={HISTORY_COLUMNS} keyExtractor={(r) => r.id} emptyMessage="No payout requests yet." />
      </div>
    </div>
  );
}
