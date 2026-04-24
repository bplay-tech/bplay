"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/Button";
import { formatAddress } from "@/lib/utils";
import { wagmiConfig } from "@/lib/wagmi";

const connector = wagmiConfig.connectors[0];

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [error, setError] = useState<string | null>(null);

  const handleConnect = () => {
    setError(null);
    connect(
      { connector },
      {
        onError: (e) => setError(e.message),
      }
    );
  };

  if (isConnected && address) {
    return (
      <Button variant="outline" size="sm" onClick={() => disconnect()}>
        {formatAddress(address)}
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <Button size="sm" loading={isPending} onClick={handleConnect}>
        Connect Wallet
      </Button>
      {error && <p className="text-xs text-red-400 text-center max-w-xs">{error}</p>}
    </div>
  );
}
