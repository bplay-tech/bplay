"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { loginAction } from "@/features/auth/actions";

export function LoginForm({ resetSuccess }: { resetSuccess?: boolean }) {
  const [state, action, pending] = useActionState(loginAction, null);
  const [showPass, setShowPass] = useState(false);

  return (
    <Card className="mt-4">
      <h2 className="text-lg font-semibold text-foreground mb-6">Sign in to your account</h2>
      {resetSuccess && (
        <div className="mb-4 rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400 text-center">
          Password updated successfully. Sign in with your new password.
        </div>
      )}
      <form action={action} className="flex flex-col gap-4">
        <Input
          id="login-email"
          name="email"
          type="email"
          label="Email"
          placeholder="you@bplay.io"
          required
        />
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
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
        {state?.error && (
          <p className="text-sm text-danger text-center">{state.error}</p>
        )}
        <Button type="submit" loading={pending} className="mt-2 w-full">
          Sign In
        </Button>
      </form>
    </Card>
  );
}
