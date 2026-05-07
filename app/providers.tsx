"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, type State } from "wagmi";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { createAppKit } from "@reown/appkit/react";
import { useState, useEffect, type ReactNode } from "react";
import { wagmiAdapter, projectId, networks } from "@/lib/wagmi";

createAppKit({
  adapters: [wagmiAdapter],
  projectId: projectId!,
  networks,
  defaultNetwork: networks[0],
  metadata: {
    name: "BPLAY Partner Portal",
    description: "Manage your BPLAY partner commissions, referrals, and payouts",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    icons: ["/favicon.ico"],
  },
  allowUnsupportedChain: false,
  features: {
    analytics: true,
    email: false,
    socials: false,
  },
});

function SessionGuard() {
  const { data: session } = useSession();
  useEffect(() => {
    if (session?.error === "RefreshFailed") {
      signOut({ callbackUrl: "/login" });
    }
  }, [session?.error]);
  return null;
}

type ProvidersProps = { children: ReactNode; initialState?: State };

export function Providers({ children, initialState }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <SessionGuard />
      <WagmiProvider config={wagmiAdapter.wagmiConfig} initialState={initialState}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </SessionProvider>
  );
}
