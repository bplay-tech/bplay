import { BplayLogo } from "@/components/ui/BplayLogo";
import { Card } from "@/components/ui/Card";
import { ResetPasswordForm } from "./ResetPasswordForm";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="flex flex-col items-center mb-8">
          <BplayLogo size="xl" />
          <span className="mt-3 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            Partner Zone
          </span>
        </div>

        <Card>
          {!token ? (
            <>
              <h2 className="text-lg font-semibold text-foreground mb-2">Invalid Reset Link</h2>
              <p className="text-sm text-muted">
                This password reset link is missing or malformed. Please request a new one.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-foreground mb-1">Set a new password</h2>
              <p className="text-sm text-muted mb-6">Choose a strong password for your account.</p>
              <ResetPasswordForm token={token} />
            </>
          )}
        </Card>

      </div>
    </div>
  );
}
