"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/Badge";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { Table, type Column } from "@/components/ui/Table";
import { CreateMemberModal } from "./CreateMemberModal";
import { TransferAddressModal } from "./TransferAddressModal";
import { BuyBplaySection } from "@/features/purchases/components/BuyBplaySection";
import { deactivateUserAction } from "@/features/team/actions";
import { formatAddress } from "@/lib/utils";
import type { UserWithTier } from "@/db/queries/users";

interface TeamClientProps {
  members: UserWithTier[];
  isSuperAdmin: boolean;
  rate: number;
  recipientAddress: string;
  usdcContractAddress: string;
}

export function TeamClient({ members, isSuperAdmin, rate, recipientAddress, usdcContractAddress }: TeamClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [transferModal, setTransferModal] = useState<{ userId: string; current: string | null } | null>(null);

  const columns: Column<UserWithTier>[] = [
    {
      header: "Member",
      key: "member",
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.name} size="sm" />
          <div>
            <p className="text-sm font-medium text-foreground">{r.name}</p>
            <p className="text-xs text-muted">{r.email}</p>
          </div>
        </div>
      ),
    },
    { header: "Role", key: "role", render: (r) => <StatusBadge status={r.role} /> },
    {
      header: "Commission",
      key: "commission",
      render: (r) => <span className="text-sm text-foreground">{parseFloat(r.tier.commissionRate)}%</span>,
    },
    {
      header: "Tier",
      key: "tier",
      render: (r) => <span className="text-sm text-muted">{r.tier.name}</span>,
    },
    {
      header: "Status",
      key: "status",
      render: (r) => <StatusBadge status={r.isActive ? "confirmed" : "failed"} />,
    },
    ...(isSuperAdmin
      ? [
          {
            header: "Transfer Address",
            key: "transferAddress",
            render: (r: UserWithTier) => (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted">
                  {r.transferAddress ? formatAddress(r.transferAddress) : "—"}
                </span>
                <button
                  onClick={() => setTransferModal({ userId: r.id, current: r.transferAddress ?? null })}
                  className="p-1 rounded hover:bg-card-border/30 text-muted"
                  title="Edit transfer address"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              </div>
            ),
          },
          {
            header: "Actions",
            key: "actions",
            render: (r: UserWithTier) => (
              <DropdownMenu
                trigger={
                  <button className="p-1.5 rounded-md hover:bg-card-border/30 text-muted">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                }
                items={[
                  {
                    label: "Deactivate",
                    onClick: () => deactivateUserAction(r.id),
                    variant: "danger" as const,
                  },
                ]}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-8">
      <BuyBplaySection rate={rate} recipientAddress={recipientAddress} usdcContractAddress={usdcContractAddress} />

      <div className="border-t border-card-border pt-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Team Management</h1>
            <p className="text-sm text-muted mt-1">
              {isSuperAdmin ? "All partners in the system" : "Partners you referred"}
            </p>
          </div>
          {isSuperAdmin && <Button onClick={() => setModalOpen(true)}>Add Member</Button>}
        </div>
        <Table data={members} columns={columns} keyExtractor={(r) => r.id} emptyMessage="No team members found." />
      </div>

      {isSuperAdmin && <CreateMemberModal open={modalOpen} onOpenChange={setModalOpen} />}
      {transferModal && (
        <TransferAddressModal
          userId={transferModal.userId}
          currentAddress={transferModal.current}
          open={!!transferModal}
          onOpenChange={(v) => { if (!v) setTransferModal(null); }}
        />
      )}
    </div>
  );
}
