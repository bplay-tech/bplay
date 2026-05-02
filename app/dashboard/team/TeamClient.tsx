"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { Table, type Column } from "@/components/ui/Table";
import { CreateMemberModal } from "./CreateMemberModal";
import { TransferAddressModal } from "./TransferAddressModal";
import { deleteUserAction, updateUserRoleAction, updateUserTierAction } from "@/features/team/actions";
import { formatAddress } from "@/lib/utils";
import type { UserWithTierAndWallet } from "@/db/queries/users";
import type { PartnerTier } from "@/db/schema/partner-tiers";

interface TeamClientProps {
  members: UserWithTierAndWallet[];
  tiers: PartnerTier[];
  role: "ADMIN" | "SUPER_ADMIN";
}

export function TeamClient({ members, tiers, role }: TeamClientProps) {
  const isSuperAdmin = role === "SUPER_ADMIN";
  const canManageMembers = role === "ADMIN" || role === "SUPER_ADMIN";
  const [modalOpen, setModalOpen] = useState(false);
  const [transferModal, setTransferModal] = useState<{ userId: string; current: string | null } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const tierOptions = tiers.map((t) => ({ value: t.name, label: t.name }));

  const columns: Column<UserWithTierAndWallet>[] = [
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
      render: (r) =>
        isSuperAdmin && r.role !== "SUPER_ADMIN" ? (
          <Select
            value={r.tier.name}
            onValueChange={(tierName) => {
              startTransition(async () => {
                await updateUserTierAction(r.id, tierName);
                toast.success(`Tier updated to ${tierName}`);
              });
            }}
            options={tierOptions}
          />
        ) : (
          <span className="text-sm text-muted">{r.tier.name}</span>
        ),
    },
    {
      header: "Status",
      key: "status",
      render: (r) => <StatusBadge status={r.isActive ? "confirmed" : "failed"} />,
    },
    {
      header: "Wallet",
      key: "wallet",
      render: (r) => (
        <span className="text-xs font-mono text-muted">
          {r.walletAddress ? formatAddress(r.walletAddress) : "—"}
        </span>
      ),
    },
    ...(isSuperAdmin
      ? [
          {
            header: "Transfer Address",
            key: "transferAddress",
            render: (r: UserWithTierAndWallet) => (
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
            render: (r: UserWithTierAndWallet) => (
              <DropdownMenu
                trigger={
                  <button className="p-1.5 rounded-md hover:bg-card-border/30 text-muted">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                }
                items={[
                  ...(r.role !== "SUPER_ADMIN"
                    ? [
                        {
                          label:
                            changingRoleId === r.id
                              ? "Updating…"
                              : r.role === "USER"
                              ? "Promote to Admin"
                              : "Demote to User",
                          disabled: changingRoleId === r.id,
                          onClick: () => {
                            setChangingRoleId(r.id);
                            const newRole = r.role === "USER" ? "ADMIN" : "USER";
                            startTransition(async () => {
                              const result = await updateUserRoleAction(r.id, newRole);
                              setChangingRoleId(null);
                              if ("error" in result) toast.error(result.error);
                              else toast.success(`Role updated to ${newRole}`);
                            });
                          },
                        },
                      ]
                    : []),
                  {
                    label: deletingId === r.id ? "Deleting…" : "Delete",
                    disabled: deletingId === r.id,
                    onClick: () => {
                      setDeletingId(r.id);
                      startTransition(async () => {
                        await deleteUserAction(r.id);
                        setDeletingId(null);
                        toast.success("Member deleted");
                      });
                    },
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
    <div className="flex flex-col gap-4">
      {canManageMembers && (
        <div className="flex justify-end">
          <Button onClick={() => setModalOpen(true)}>Add Member</Button>
        </div>
      )}
      <Table data={members} columns={columns} keyExtractor={(r) => r.id} emptyMessage="No team members found." />
      {canManageMembers && <CreateMemberModal open={modalOpen} onOpenChange={setModalOpen} isSuperAdmin={isSuperAdmin} />}
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
