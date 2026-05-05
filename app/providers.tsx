"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { SessionProvider } from "next-auth/react";
import { createAppKit } from "@reown/appkit/react";
import { useState, type ReactNode } from "react";
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

type ProvidersProps = { children: ReactNode };

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </SessionProvider>
  );
}
