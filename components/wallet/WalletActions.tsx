"use client";

import { useState, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { Button } from "@/components/ui/Button";
import { formatAddress } from "@/lib/utils";

export function WalletActions() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || !isConnected || !address) return null;

  const handleSwitch = () => {
    disconnect();
    setTimeout(() => open(), 300);
  };

  return (
    <div className="rounded-xl border border-card-border bg-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
        <span className="text-xs text-muted">Connected</span>
        <span className="text-xs font-mono text-foreground ml-auto">{formatAddress(address)}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSwitch}
          className="w-full text-xs"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Switch Wallet
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => disconnect()}
          className="w-full text-xs"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Disconnect
        </Button>
      </div>
    </div>
  );
}
