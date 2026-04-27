"use client";

import { useState } from "react";
import { RequestPayoutModal } from "./RequestPayoutModal";
import { Button } from "@/components/ui/Button";
import { Table, type Column } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { approvePayoutAction, rejectPayoutAction } from "@/features/payouts/actions";
import { formatUsd } from "@/lib/exchange";
import type { PayoutRequest } from "@/db/schema/payout-requests";
import type { PayoutRequestWithUser } from "@/db/queries/payout-requests";

interface PayoutsClientProps {
  availableBalance: number;
  history: PayoutRequest[];
  pendingAll?: PayoutRequestWithUser[];
  isSuperAdmin: boolean;
}

const HISTORY_COLUMNS: Column<PayoutRequest>[] = [
  { header: "Amount", key: "amount", render: (r) => <span className="font-medium">{formatUsd(r.amount)}</span> },
  { header: "Method", key: "method", render: (r) => <span className="text-muted">{r.payoutMethod}</span> },
  { header: "Date", key: "date", render: (r) => <span className="text-muted">{new Date(r.createdAt).toLocaleDateString()}</span> },
  { header: "Status", key: "status", render: (r) => <StatusBadge status={r.status} /> },
];

function AdminRow({ req, onApprove, onReject }: { req: PayoutRequestWithUser; onApprove: () => void; onReject: () => void }) {
  return (
    <tr className="bg-card hover:bg-card/70 transition-colors border-b border-card-border">
      <td className="px-4 py-3 text-foreground">{req.userName}</td>
      <td className="px-4 py-3 font-medium text-foreground">{formatUsd(req.amount)}</td>
      <td className="px-4 py-3 text-muted">{req.payoutMethod}</td>
      <td className="px-4 py-3 font-mono text-xs text-muted">{req.walletAddress ? req.walletAddress.slice(0, 16) + "…" : "—"}</td>
      <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <Button size="sm" variant="success" onClick={onApprove}>Approve</Button>
          <Button size="sm" variant="danger" onClick={onReject}>Reject</Button>
        </div>
      </td>
    </tr>
  );
}

export function PayoutsClient({ availableBalance, history, pendingAll, isSuperAdmin }: PayoutsClientProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted">Available Balance</p>
          <p className="text-3xl font-bold text-foreground">{formatUsd(availableBalance)}</p>
        </div>
        <Button onClick={() => setModalOpen(true)} disabled={availableBalance < 50} className="w-full sm:w-auto">
          Request Payout
        </Button>
      </div>

      <RequestPayoutModal open={modalOpen} onOpenChange={setModalOpen} availableBalance={availableBalance} />

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
                  <AdminRow
                    key={req.id}
                    req={req}
                    onApprove={() => approvePayoutAction(req.id)}
                    onReject={() => rejectPayoutAction(req.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Payout History</h2>
        <Table data={history} columns={HISTORY_COLUMNS} keyExtractor={(r) => r.id} emptyMessage="No payout requests yet." />
      </div>
    </div>
  );
}
