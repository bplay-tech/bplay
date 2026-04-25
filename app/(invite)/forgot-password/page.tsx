import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">

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
          <h2 className="text-lg font-semibold text-foreground mb-1">Forgot your password?</h2>
          <p className="text-sm text-muted mb-6">
            Enter your email and we&apos;ll send you a link to reset it.
          </p>
          <ForgotPasswordForm />
          <p className="text-sm text-center text-muted mt-5">
            Remember it?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Back to sign in
            </Link>
          </p>
        </Card>

      </div>
    </div>
  );
}
