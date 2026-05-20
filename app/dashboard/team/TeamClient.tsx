"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Table, type Column } from "@/components/ui/Table";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CreateMemberModal } from "./CreateMemberModal";
import { TransferAddressModal } from "./TransferAddressModal";
import { deleteUserAction, updateUserRoleAction, updateUserTierAction } from "@/features/team/actions";
import { formatAddress } from "@/lib/utils";
import type { UserWithTierWalletAndManager } from "@/db/queries/users";
import type { PartnerTier } from "@/db/schema/partner-tiers";

interface TeamClientProps {
  members: UserWithTierWalletAndManager[];
  tiers: PartnerTier[];
  role: "ADMIN" | "SUPER_ADMIN";
}

export function TeamClient({ members, tiers, role }: TeamClientProps) {
  const isSuperAdmin = role === "SUPER_ADMIN";
  const adminUsers = members
    .filter((m) => m.role === "ADMIN")
    .map((m) => ({ id: m.id, name: m.name }));
  const canManageMembers = role === "ADMIN" || role === "SUPER_ADMIN";
  const [modalOpen, setModalOpen] = useState(false);
  const [transferModal, setTransferModal] = useState<{ userId: string; current: string | null } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const tierOptions = tiers.map((t) => ({ value: t.name, label: t.name }));

  const columns: Column<UserWithTierWalletAndManager>[] = [
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
    {
      header: "Role",
      key: "role",
      render: (r) => {
        const canEdit = isSuperAdmin
          ? r.role !== "SUPER_ADMIN"
          : r.role !== "SUPER_ADMIN" && r.role !== "ADMIN";
        if (!canEdit) return <StatusBadge status={r.role} />;
        const roleOptions = isSuperAdmin
          ? [
              { value: "USER", label: "User" },
              { value: "SALES", label: "Sales" },
              { value: "ADMIN", label: "Admin" },
            ]
          : [
              { value: "USER", label: "User" },
              { value: "SALES", label: "Sales" },
            ];
        return (
          <Select
            value={r.role}
            disabled={changingRoleId === r.id}
            onValueChange={(newRole) => {
              setChangingRoleId(r.id);
              startTransition(async () => {
                const result = await updateUserRoleAction(r.id, newRole as "USER" | "SALES" | "ADMIN");
                setChangingRoleId(null);
                if ("error" in result) toast.error(result.error);
                else toast.success(`Role updated to ${newRole}`);
              });
            }}
            options={roleOptions}
          />
        );
      },
    },
    {
      header: "Commission",
      key: "commission",
      render: (r) => (
        <span className="text-sm text-foreground">
          {r.role === "USER" ? "0%" : `${parseFloat(r.tier?.commissionRate ?? "0")}%`}
        </span>
      ),
    },
    {
      header: "Tier",
      key: "tier",
      render: (r) => {
        if (r.role === "USER" || !r.tier) return <span className="text-sm text-muted">—</span>;
        if (isSuperAdmin) {
          return (
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
          );
        }
        return <span className="text-sm text-muted">{r.tier.name}</span>;
      },
    },
    ...(isSuperAdmin
      ? [
          {
            header: "Admin",
            key: "manager",
            render: (r: UserWithTierWalletAndManager) =>
              r.role === "USER" || r.role === "SALES" ? (
                <span className="text-sm text-muted">{r.managerName ?? "—"}</span>
              ) : (
                <span className="text-sm text-muted">—</span>
              ),
          },
        ]
      : []),
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
            render: (r: UserWithTierWalletAndManager) => (
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
            header: "",
            key: "delete",
            render: (r: UserWithTierWalletAndManager) => (
              <button
                onClick={() => setConfirmDeleteId(r.id)}
                disabled={deletingId === r.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-danger border border-danger/30 hover:bg-danger/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {deletingId === r.id ? "Deleting…" : "Delete"}
              </button>
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
      {canManageMembers && (
        <CreateMemberModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          actorRole={role}
          adminUsers={adminUsers}
        />
      )}
      {transferModal && (
        <TransferAddressModal
          userId={transferModal.userId}
          currentAddress={transferModal.current}
          open={!!transferModal}
          onOpenChange={(v) => { if (!v) setTransferModal(null); }}
        />
      )}
      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete member?"
        description="This will permanently remove the member and all their data. This action cannot be undone."
        confirmLabel={deletingId ? "Deleting…" : "Delete"}
        loading={!!deletingId}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (!confirmDeleteId) return;
          const idToDelete = confirmDeleteId;
          setDeletingId(idToDelete);
          setConfirmDeleteId(null);
          startTransition(async () => {
            await deleteUserAction(idToDelete);
            setDeletingId(null);
            toast.success("Member deleted");
          });
        }}
      />
    </div>
  );
}
