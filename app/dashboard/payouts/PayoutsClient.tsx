"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Download, Clock, CheckCircle2, XCircle, ChevronLeft, ChevronRight,
  Wallet, Hash, ArrowUpRight, AlertCircle, ExternalLink, Hourglass,
} from "lucide-react";
import { RequestPayoutModal } from "./RequestPayoutModal";
import { ApprovePayoutModal } from "./ApprovePayoutModal";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { rejectPayoutAction } from "@/features/payouts/actions";
import { formatUsd } from "@/lib/exchange";
import { formatAddress } from "@/lib/utils";
import type { PayoutRequestEnriched, PayoutRequestWithUser } from "@/db/queries/payout-requests";

interface PayoutsClientProps {
  availableBalance: number;
  onHold: number;
  history: PayoutRequestEnriched[];
  pendingAll?: PayoutRequestWithUser[];
  completedAll?: PayoutRequestWithUser[];
  isSuperAdmin: boolean;
  savedWallet: string | null;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function formatDt(d: Date | string) {
  const dt = new Date(d);
  return {
    date: dt.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }),
    time: dt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
  };
}

function formatDuration(from: Date | string, to: Date | string): string {
  const ms = new Date(to).getTime() - new Date(from).getTime();
  const mins = Math.floor(ms / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${mins % 60}m`;
  return `${Math.max(1, mins)}m`;
}

function timeAgo(d: Date | string): string {
  const ms = Date.now() - new Date(d).getTime();
  const mins = Math.floor(ms / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} day${days !== 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${Math.max(1, mins)}m ago`;
}

const STATUS_CONFIG = {
  pending:  { color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.25)",  accent: "#d97706" },
  approved: { color: "#4ade80", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.25)",   accent: "#16a34a" },
  rejected: { color: "#f87171", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",   accent: "#dc2626" },
} as const;

/* ------------------------------------------------------------------ */
/*  Timeline component                                                  */
/* ------------------------------------------------------------------ */

function Timeline({ req }: { req: PayoutRequestEnriched | PayoutRequestWithUser }) {
  const { date: rDate, time: rTime } = formatDt(req.createdAt);

  return (
    <div className="flex flex-col gap-1.5 mt-2">
      {/* Initiated */}
      <div className="flex items-center gap-2">
        <Clock className="h-3 w-3 shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
        <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
          Requested{" "}
          <span style={{ color: "rgba(255,255,255,0.55)" }}>{rDate}</span>
          <span style={{ color: "rgba(255,255,255,0.25)" }}> · {rTime}</span>
        </span>
      </div>

      {/* Review result */}
      {req.status === "pending" ? (
        <div className="flex items-center gap-2">
          <Hourglass className="h-3 w-3 shrink-0" style={{ color: "#fbbf24" }} />
          <span className="text-[11px]" style={{ color: "rgba(251,191,36,0.7)" }}>
            Awaiting approval · pending {timeAgo(req.createdAt)}
          </span>
        </div>
      ) : req.reviewedAt ? (
        <div className="flex items-center gap-2 flex-wrap">
          {req.status === "approved" ? (
            <CheckCircle2 className="h-3 w-3 shrink-0text-green-400" style={{ color: "#4ade80" }} />
          ) : (
            <XCircle className="h-3 w-3 shrink-0" style={{ color: "#f87171" }} />
          )}
          <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
            <span style={{ color: req.status === "approved" ? "rgba(74,222,128,0.8)" : "rgba(248,113,113,0.8)" }}>
              {req.status === "approved" ? "Approved" : "Rejected"}
            </span>{" "}
            <span style={{ color: "rgba(255,255,255,0.55)" }}>
              {formatDt(req.reviewedAt).date}
            </span>
            <span style={{ color: "rgba(255,255,255,0.25)" }}>
              {" · "}{formatDt(req.reviewedAt).time}
            </span>
            {req.reviewerName && (
              <span style={{ color: "rgba(255,255,255,0.3)" }}> · by {req.reviewerName}</span>
            )}
            <span style={{ color: "rgba(255,255,255,0.2)" }}>
              {" · after "}{formatDuration(req.createdAt, req.reviewedAt)}
            </span>
          </span>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  History row                                                         */
/* ------------------------------------------------------------------ */

function HistoryRow({ req, partnerName }: { req: PayoutRequestEnriched | PayoutRequestWithUser; partnerName?: string }) {
  const cfg = STATUS_CONFIG[req.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;

  return (
    <div
      className="relative flex flex-col sm:flex-row gap-4 px-5 py-4 border-b last:border-0 transition-colors"
      style={{ borderColor: "rgba(255,255,255,0.045)" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.018)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      {/* Left accent */}
      <div className="absolute left-0 top-3 bottom-3 w-0.75 rounded-full" style={{ background: cfg.accent }} />

      {/* Icon + details */}
      <div className="flex items-start gap-3 flex-1 min-w-0 pl-3">
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold" style={{ color: cfg.color }}>
              {partnerName ? `${partnerName} · ` : ""}Commission Payout
            </span>
            <StatusBadge status={req.status} />
          </div>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              via <span style={{ color: "rgba(255,255,255,0.55)" }}>{req.payoutMethod}</span>
            </span>
            {req.walletAddress && (
              <span className="flex items-center gap-1 text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
                <Wallet className="h-2.5 w-2.5" />
                {formatAddress(req.walletAddress)}
              </span>
            )}
          </div>

          <Timeline req={req} />

          {req.txHash && (
            <a
              href={`https://etherscan.io/tx/${req.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 mt-1.5"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              <Hash className="h-2.5 w-2.5" />
              <span className="text-[10px] font-mono hover:text-white/40 transition-colors">
                {req.txHash.slice(0, 22)}…
              </span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}

          {req.notes && req.notes !== "Payout approved" && (
            <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>{req.notes}</p>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 shrink-0 pl-13 sm:pl-0">
        <p className="text-base font-bold tabular-nums" style={{ color: cfg.color }}>
          −{formatUsd(req.amount)}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pending approval card (SUPER_ADMIN)                                 */
/* ------------------------------------------------------------------ */

function PendingCard({
  req,
  onApprove,
  onReject,
  rejectingId,
}: {
  req: PayoutRequestWithUser;
  onApprove: () => void;
  onReject: () => void;
  rejectingId: string | null;
}) {
  return (
    <div
      className="relative rounded-xl px-5 py-4 flex flex-col gap-3"
      style={{ background: "#0f1520", border: "1px solid rgba(251,191,36,0.2)" }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-0.75 rounded-l-xl" style={{ background: "#d97706" }} />

      <div className="flex items-start justify-between gap-3 pl-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{req.userName}</span>
            <StatusBadge status={req.status} />
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              via <span style={{ color: "rgba(255,255,255,0.65)" }}>{req.payoutMethod}</span>
            </span>
            {req.walletAddress && (
              <span className="flex items-center gap-1 text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
                <Wallet className="h-2.5 w-2.5" />
                {formatAddress(req.walletAddress)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Clock className="h-3 w-3" style={{ color: "#fbbf24" }} />
            <span className="text-[11px]" style={{ color: "rgba(251,191,36,0.7)" }}>
              Requested {timeAgo(req.createdAt)} ·{" "}
              <span style={{ color: "rgba(255,255,255,0.3)" }}>
                {formatDt(req.createdAt).date} {formatDt(req.createdAt).time}
              </span>
            </span>
          </div>
        </div>

        <p className="text-xl font-bold tabular-nums shrink-0" style={{ color: "#fbbf24" }}>
          {formatUsd(req.amount)}
        </p>
      </div>

      <div className="flex gap-2 pl-3">
        <Button size="sm" variant="success" onClick={onApprove}>
          Approve
        </Button>
        <Button
          size="sm"
          variant="danger"
          loading={rejectingId === req.id}
          disabled={rejectingId !== null}
          onClick={onReject}
        >
          Reject
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pagination                                                          */
/* ------------------------------------------------------------------ */

function Pagination({
  page, totalPages, total, pageSize, onPageChange,
}: {
  page: number; totalPages: number; total: number; pageSize: number;
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
        Showing {start}–{end} of {total} payout{total !== 1 ? "s" : ""}
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

function exportCsv(data: (PayoutRequestEnriched | PayoutRequestWithUser)[], includePartner: boolean) {
  const headers = [
    ...(includePartner ? ["Partner"] : []),
    "Amount (USD)", "Method", "Wallet",
    "Requested At", "Reviewed At", "Duration",
    "Reviewed By", "Status", "TX Hash", "Notes",
  ];
  const rows = data.map((r) => {
    const duration = r.reviewedAt ? formatDuration(r.createdAt, r.reviewedAt) : "";
    const base = [
      formatUsd(r.amount),
      r.payoutMethod,
      r.walletAddress ?? "",
      new Date(r.createdAt).toISOString(),
      r.reviewedAt ? new Date(r.reviewedAt).toISOString() : "",
      duration,
      r.reviewerName ?? "",
      r.status,
      r.txHash ?? "",
      r.notes ?? "",
    ];
    return includePartner ? [(r as PayoutRequestWithUser).userName ?? "", ...base] : base;
  });
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((row) => row.map(esc).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `payouts-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/*  Section ledger wrapper                                              */
/* ------------------------------------------------------------------ */

function LedgerSection({
  title,
  count,
  children,
  onExport,
  exportDisabled,
  footer,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
  onExport?: () => void;
  exportDisabled?: boolean;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          {count !== undefined && count > 0 && (
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
            >
              {count}
            </span>
          )}
        </div>
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport} disabled={exportDisabled}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        )}
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#0f1520", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {children}
        {footer && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PayoutsClient                                                       */
/* ------------------------------------------------------------------ */

const PAGE_SIZE = 15;

export function PayoutsClient({
  availableBalance,
  onHold,
  history,
  pendingAll,
  completedAll,
  isSuperAdmin,
  savedWallet,
}: PayoutsClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [approving, setApproving] = useState<PayoutRequestWithUser | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [allHistoryPage, setAllHistoryPage] = useState(1);
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

  const historySlice = history.slice((historyPage - 1) * PAGE_SIZE, historyPage * PAGE_SIZE);
  const historyPages = Math.ceil(history.length / PAGE_SIZE);

  const allHistory = completedAll ?? [];
  const allHistorySlice = allHistory.slice((allHistoryPage - 1) * PAGE_SIZE, allHistoryPage * PAGE_SIZE);
  const allHistoryPages = Math.ceil(allHistory.length / PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">

      {/* Balance header */}
      <div
        className="rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        style={{ background: "#0f1520", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium tracking-wide" style={{ color: "rgba(255,255,255,0.35)" }}>
            Available Balance
          </p>
          <p className="text-3xl font-bold text-white tabular-nums">{formatUsd(availableBalance)}</p>
          {onHold > 0 && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <Hourglass className="h-3 w-3" style={{ color: "#fbbf24" }} />
              <p className="text-xs" style={{ color: "#fbbf24" }}>
                {formatUsd(onHold)} on hold — pending approval
              </p>
            </div>
          )}
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          disabled={availableBalance <= 0}
          className="w-full sm:w-auto"
        >
          Request Payout
        </Button>
      </div>

      <RequestPayoutModal open={modalOpen} onOpenChange={setModalOpen} availableBalance={availableBalance} savedWallet={savedWallet} />
      <ApprovePayoutModal request={approving} onOpenChange={(open) => { if (!open) setApproving(null); }} />

      {/* SUPER_ADMIN: pending approvals */}
      {isSuperAdmin && pendingAll && pendingAll.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white">Pending Approvals</h2>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}
            >
              {pendingAll.length}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {pendingAll.map((req) => (
              <PendingCard
                key={req.id}
                req={req}
                onApprove={() => setApproving(req)}
                onReject={() => handleReject(req.id)}
                rejectingId={rejectingId}
              />
            ))}
          </div>
        </div>
      )}

      {/* SUPER_ADMIN: all history */}
      {isSuperAdmin && (
        <LedgerSection
          title="All Payout History"
          count={allHistory.length}
          onExport={() => exportCsv(allHistory, true)}
          exportDisabled={allHistory.length === 0}
          footer={
            <Pagination
              page={allHistoryPage}
              totalPages={allHistoryPages}
              total={allHistory.length}
              pageSize={PAGE_SIZE}
              onPageChange={setAllHistoryPage}
            />
          }
        >
          {allHistory.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10">
              <AlertCircle className="h-7 w-7" style={{ color: "rgba(255,255,255,0.1)" }} />
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>No completed payouts yet.</p>
            </div>
          ) : (
            allHistorySlice.map((req) => (
              <HistoryRow
                key={req.id}
                req={req}
                partnerName={(req as PayoutRequestWithUser).userName}
              />
            ))
          )}
        </LedgerSection>
      )}

      {/* Personal history */}
      <LedgerSection
        title="My Payout History"
        count={history.length}
        onExport={() => exportCsv(history, false)}
        exportDisabled={history.length === 0}
        footer={
          <Pagination
            page={historyPage}
            totalPages={historyPages}
            total={history.length}
            pageSize={PAGE_SIZE}
            onPageChange={setHistoryPage}
          />
        }
      >
        {history.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10">
            <ArrowUpRight className="h-7 w-7" style={{ color: "rgba(255,255,255,0.1)" }} />
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>No payout requests yet.</p>
            {availableBalance > 0 && (
              <button
                className="text-xs mt-0.5 underline"
                style={{ color: "rgba(167,139,250,0.6)" }}
                onClick={() => setModalOpen(true)}
              >
                Request your first payout
              </button>
            )}
          </div>
        ) : (
          historySlice.map((req) => <HistoryRow key={req.id} req={req} />)
        )}
      </LedgerSection>
    </div>
  );
}
