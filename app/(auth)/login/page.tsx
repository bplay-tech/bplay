import Link from "next/link";
import { BplayLogo } from "@/components/ui/BplayLogo";
import { LoginForm } from "./LoginForm";

interface LoginPageProps {
  searchParams: Promise<{ reset?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { reset } = await searchParams;

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link href="/">
            <BplayLogo size="xl" />
          </Link>
          <span className="mt-3 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            Partner Zone
          </span>
        </div>
        <LoginForm resetSuccess={reset === "1"} />
      </div>
    </div>
  );
}
