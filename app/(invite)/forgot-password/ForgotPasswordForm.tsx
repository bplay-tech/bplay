"use client";

import { useActionState } from "react";
import { MailCheck } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { forgotPasswordAction } from "@/features/auth/actions";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, null);

  if (state?.success) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <div className="h-12 w-12 rounded-full bg-green-500/15 flex items-center justify-center">
          <MailCheck className="h-6 w-6 text-green-400" />
        </div>
        <p className="text-sm font-medium text-foreground">Check your inbox</p>
        <p className="text-sm text-muted">
          If an account exists for that email, a reset link has been sent. It expires in 1 hour.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        name="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        autoComplete="email"
        required
      />
      {state?.error && (
        <p className="text-sm text-danger text-center">{state.error}</p>
      )}
      <Button type="submit" loading={pending} className="w-full">
        Send Reset Link
      </Button>
    </form>
  );
}
