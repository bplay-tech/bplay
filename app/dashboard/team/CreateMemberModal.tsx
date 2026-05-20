"use client";

import { useActionState, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { createUserAction } from "@/features/team/actions";

const SUPER_ADMIN_ROLE_OPTIONS = [
  { value: "USER", label: "User" },
  { value: "SALES", label: "Sales" },
  { value: "ADMIN", label: "Admin" },
];

const ADMIN_ROLE_OPTIONS = [
  { value: "USER", label: "User" },
  { value: "SALES", label: "Sales" },
];

interface CreateMemberModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  actorRole: "ADMIN" | "SUPER_ADMIN";
  adminUsers?: { id: string; name: string }[];
}

export function CreateMemberModal({ open, onOpenChange, actorRole, adminUsers = [] }: CreateMemberModalProps) {
  const [state, action, pending] = useActionState(createUserAction, null);
  const [role, setRole] = useState("USER");
  const [adminId, setAdminId] = useState(() => adminUsers[0]?.id ?? "");
  const roleOptions = actorRole === "SUPER_ADMIN" ? SUPER_ADMIN_ROLE_OPTIONS : ADMIN_ROLE_OPTIONS;

  const needsAdminSelector =
    actorRole === "SUPER_ADMIN" && (role === "USER" || role === "SALES") && adminUsers.length > 0;

  const adminOptions = adminUsers.map((a) => ({ value: a.id, label: a.name }));

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Invite Team Member">
      <form action={action} className="flex flex-col gap-4">
        <Input name="name" label="Full Name" placeholder="Jane Doe" required />
        <Input name="email" label="Email" type="email" placeholder="jane@example.com" required />
        <Select label="Role" value={role} onValueChange={setRole} options={roleOptions} />
        <input type="hidden" name="role" value={role} />
        {needsAdminSelector && (
          <>
            <Select label="Assign to Admin" value={adminId} onValueChange={setAdminId} options={adminOptions} />
            <input type="hidden" name="adminId" value={adminId} />
          </>
        )}
        {state && "error" in state && <p className="text-sm text-danger">{state.error}</p>}
        {state && "success" in state && (
          <p className="text-sm text-success">Invitation email sent successfully!</p>
        )}
        <Button type="submit" loading={pending} className="w-full">Send Invitation</Button>
      </form>
    </Modal>
  );
}
