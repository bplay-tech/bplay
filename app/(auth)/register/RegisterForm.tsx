"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { registerViaReferralAction } from "@/features/affiliate/actions";

export function RegisterForm({ referralCode }: { referralCode: string }) {
  const action = registerViaReferralAction.bind(null, referralCode);
  const [state, formAction, pending] = useActionState(action, null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        name="name"
        label="Full Name"
        type="text"
        placeholder="Jane Doe"
        autoComplete="name"
        required
      />
      <Input
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        required
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Password</label>
        <div className="relative">
          <input
            name="password"
            type={showPass ? "text" : "password"}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            required
            className="h-10 w-full rounded-lg border border-card-border bg-card px-3 pr-10 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
          >
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Confirm Password</label>
        <div className="relative">
          <input
            name="confirm"
            type={showConfirm ? "text" : "password"}
            placeholder="Repeat password"
            autoComplete="new-password"
            required
            className="h-10 w-full rounded-lg border border-card-border bg-card px-3 pr-10 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {state?.error && (
        <p className="text-sm text-danger text-center">{state.error}</p>
      )}
      <Button type="submit" loading={pending} className="mt-2 w-full">
        Create Account & Buy Tokens
      </Button>
    </form>
  );
}
