"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import { approvePurchaseAction, rejectPurchaseAction } from "@/features/purchases/actions";
import type { BplayPurchaseWithUser } from "@/db/queries/bplay-purchases";

function ActionButtons({ purchase }: { purchase: BplayPurchaseWithUser }) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const canApprove = purchase.status === "payment_confirmed";

  const handle = async (type: "approve" | "reject") => {
    setLoading(type);
    try {
      if (type === "approve") {
        await approvePurchaseAction(purchase.id);
        toast.success(`Purchase approved — ${parseFloat(purchase.bplayAmount).toLocaleString()} BPLAY sent`);
      } else {
        await rejectPurchaseAction(purchase.id);
        toast.success("Purchase rejected.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="success"
        loading={loading === "approve"}
        disabled={loading !== null || !canApprove}
        onClick={() => handle("approve")}
        title={!canApprove ? "Payment not yet confirmed" : undefined}
      >
        Approve
      </Button>
      <Button
        size="sm"
        variant="danger"
        loading={loading === "reject"}
        disabled={loading !== null}
        onClick={() => handle("reject")}
      >
        Reject
      </Button>
    </div>
  );
}

const COLUMNS: Column<BplayPurchaseWithUser>[] = [
  { header: "Buyer", key: "buyer", render: (r) => <span className="text-sm font-medium">{r.userName}</span> },
  { header: "Wallet", key: "wallet", render: (r) => <span className="font-mono text-xs text-muted">{r.buyerWallet.slice(0, 12)}…</span> },
  { header: "USDC", key: "usdc", render: (r) => <span className="font-medium">${parseFloat(r.usdcAmount).toFixed(2)}</span> },
  { header: "BPLAY", key: "bplay", render: (r) => <span>{parseFloat(r.bplayAmount).toLocaleString()}</span> },
  { header: "Rate", key: "rate", render: (r) => <span className="text-muted text-xs">{parseFloat(r.exchangeRate).toFixed(2)}</span> },
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
  { header: "Date", key: "date", render: (r) => <span className="text-muted text-xs">{new Date(r.createdAt).toLocaleDateString("en-US")}</span> },
  { header: "Status", key: "status", render: (r) => <StatusBadge status={r.status} /> },
  {
    header: "Actions",
    key: "actions",
    render: (r) =>
      r.status === "pending_payment" || r.status === "payment_confirmed" ? (
        <ActionButtons purchase={r} />
      ) : null,
  },
];

export function PurchasesClient({ purchases }: { purchases: BplayPurchaseWithUser[] }) {
  return <Table data={purchases} columns={COLUMNS} keyExtractor={(r) => r.id} emptyMessage="No pending purchases." />;
}
