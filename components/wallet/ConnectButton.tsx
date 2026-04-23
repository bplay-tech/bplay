"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { metaMask } from "wagmi/connectors";
import { Button } from "@/components/ui/Button";
import { formatAddress } from "@/lib/utils";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <Button variant="outline" size="sm" onClick={() => disconnect()}>
        {formatAddress(address)}
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      loading={isPending}
      onClick={() => connect({ connector: metaMask() })}
    >
      Connect Wallet
    </Button>
  );
}
