"use client";

import { useEffect, useRef } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { Button } from "@/components/ui/Button";
import { formatAddress } from "@/lib/utils";
import { saveWalletAddressAction } from "@/features/wallet/actions";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();
  const savedRef = useRef<string | null>(null);

  useEffect(() => {
    if (address && address !== savedRef.current) {
      savedRef.current = address;
      saveWalletAddressAction(address).catch(() => null);
    }
    if (!address) {
      savedRef.current = null;
    }
  }, [address]);

  if (isConnected && address) {
    return (
      <Button variant="outline" size="sm" onClick={() => disconnect()}>
        {formatAddress(address)}
      </Button>
    );
  }

  return (
    <Button size="sm" onClick={() => open()}>
      Connect Wallet
    </Button>
  );
}
