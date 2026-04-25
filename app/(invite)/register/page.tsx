import { UserCheck } from "lucide-react";
import { getUserByReferralCode } from "@/db/queries/users";
import { Card } from "@/components/ui/Card";
import { RegisterForm } from "./RegisterForm";

interface RegisterPageProps {
  searchParams: Promise<{ ref?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { ref } = await searchParams;
  const referrer = ref ? await getUserByReferralCode(ref) : null;

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* BPLAY Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">B</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">BPLAY</h1>
          <span className="mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            Partner Zone
          </span>
        </div>

        <Card>
          {!ref || !referrer ? (
            <>
              <h2 className="text-lg font-semibold text-foreground mb-2">Invalid Referral Link</h2>
              <p className="text-sm text-muted">
                This referral link is invalid or has expired. Ask your referrer to share a valid link.
              </p>
            </>
          ) : (
            <>
              {/* Referrer Banner */}
              <div className="flex items-center gap-3 p-4 rounded-xl mb-6 bg-primary/8 border border-primary/20">
                <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <UserCheck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted">Referred by</p>
                  <p className="text-sm font-semibold text-foreground">{referrer.name}</p>
                </div>
              </div>

              <h2 className="text-lg font-semibold text-foreground mb-1">Create your account</h2>
              <p className="text-sm text-muted mb-6">
                Join the BPLAY Partner Portal and buy tokens instantly.
              </p>

              <RegisterForm referralCode={ref} />
            </>
          )}
        </Card>

      </div>
    </div>
  );
}
