"use client";

import { useActionState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateProfileAction } from "@/features/settings/actions";

interface ProfileFormProps {
  name: string;
  email: string;
}

export function ProfileForm({ name, email }: ProfileFormProps) {
  const [state, action, pending] = useActionState(updateProfileAction, null);
  return (
    <Card>
      <h2 className="text-lg font-semibold text-foreground mb-4">Profile</h2>
      <form action={action} className="flex flex-col gap-4 max-w-sm">
        <Input name="name" label="Full Name" defaultValue={name} required />
        <Input name="email" label="Email" value={email} readOnly className="opacity-60 cursor-not-allowed" />
        {state && "error" in state && <p className="text-sm text-danger">{state.error}</p>}
        {state && "success" in state && <p className="text-sm text-success">Profile updated.</p>}
        <Button type="submit" loading={pending} size="sm" className="self-start">Save Changes</Button>
      </form>
    </Card>
  );
}
