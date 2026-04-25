"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { setPasswordAction } from "@/features/invite/actions";

export function SetPasswordForm({ token }: { token: string }) {
  const action = setPasswordAction.bind(null, token);
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input name="password" label="New Password" type="password" placeholder="Min. 8 characters" required />
      <Input name="confirm" label="Confirm Password" type="password" placeholder="Repeat password" required />
      {state && "error" in state && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" loading={pending} className="w-full">Set Password & Activate Account</Button>
    </form>
  );
}
