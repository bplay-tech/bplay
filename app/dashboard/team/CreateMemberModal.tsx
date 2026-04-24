"use client";

import { useActionState, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { createUserAction } from "@/features/team/actions";

const ROLE_OPTIONS = [
  { value: "SELLER", label: "Seller" },
  { value: "ADMIN", label: "Admin" },
];

interface CreateMemberModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function CreateMemberModal({ open, onOpenChange }: CreateMemberModalProps) {
  const [state, action, pending] = useActionState(createUserAction, null);
  const [role, setRole] = useState("SELLER");

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Invite Team Member">
      <form action={action} className="flex flex-col gap-4">
        <Input name="name" label="Full Name" placeholder="Jane Doe" required />
        <Input name="email" label="Email" type="email" placeholder="jane@example.com" required />
        <Select label="Role" value={role} onValueChange={setRole} options={ROLE_OPTIONS} />
        <input type="hidden" name="role" value={role} />
        {state && "error" in state && <p className="text-sm text-danger">{state.error}</p>}
        {state && "success" in state && (
          <p className="text-sm text-success">Invitation email sent successfully!</p>
        )}
        <Button type="submit" loading={pending} className="w-full">Send Invitation</Button>
      </form>
    </Modal>
  );
}
