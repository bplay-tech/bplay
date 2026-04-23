"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/Badge";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { Table, type Column } from "@/components/ui/Table";
import { CreateMemberModal } from "./CreateMemberModal";
import { deactivateUserAction } from "@/features/team/actions";
import type { UserWithTier } from "@/db/queries/users";

interface TeamClientProps {
  members: UserWithTier[];
  isSuperAdmin: boolean;
}

export function TeamClient({ members, isSuperAdmin }: TeamClientProps) {
  const [modalOpen, setModalOpen] = useState(false);

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
      ? [{
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
        }]
      : []),
  ];

  return (
    <div className="flex flex-col gap-4">
      {isSuperAdmin && (
        <div className="flex justify-end">
          <Button onClick={() => setModalOpen(true)}>Add Member</Button>
        </div>
      )}
      <Table data={members} columns={columns} keyExtractor={(r) => r.id} emptyMessage="No team members found." />
      {isSuperAdmin && <CreateMemberModal open={modalOpen} onOpenChange={setModalOpen} />}
    </div>
  );
}
