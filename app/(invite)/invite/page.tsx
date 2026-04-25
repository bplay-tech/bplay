import { verifyInviteToken } from "@/lib/invite-token";
import { Card } from "@/components/ui/Card";
import { SetPasswordForm } from "./SetPasswordForm";

interface InvitePageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function InvitePage({ searchParams }: InvitePageProps) {
  const { token } = await searchParams;
  const payload = token ? await verifyInviteToken(token) : null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        {!payload ? (
          <>
            <h1 className="text-xl font-bold text-foreground mb-2">Link Invalid or Expired</h1>
            <p className="text-sm text-muted">
              This invitation link has expired or has already been used. Contact your admin to send a new invitation.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-foreground mb-1">Welcome, {payload.name}!</h1>
            <p className="text-sm text-muted mb-6">Set a password to activate your account.</p>
            <SetPasswordForm token={token!} />
          </>
        )}
      </Card>
    </div>
  );
}
