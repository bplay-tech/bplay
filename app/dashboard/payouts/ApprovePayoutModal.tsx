"use client";

import { useState } from "react";
import { useSendTransaction, useAccount } from "wagmi";
import { parseUnits, encodeFunctionData } from "viem";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { approvePayoutAction } from "@/features/payouts/actions";
import { formatUsd } from "@/lib/exchange";
import { formatAddress } from "@/lib/utils";
import type { PayoutRequestWithUser } from "@/db/queries/payout-requests";

const ERC20_TRANSFER_ABI = [
  {
    name: "transfer",
    type: "function",
    inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

interface ApprovePayoutModalProps {
  request: PayoutRequestWithUser | null;
  onOpenChange: (open: boolean) => void;
}

export function ApprovePayoutModal({ request, onOpenChange }: ApprovePayoutModalProps) {
  const { isConnected } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usdcContractAddress = process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS as `0x${string}` | undefined;

  const handleSend = async () => {
    if (!request?.walletAddress) {
      setError("No wallet address on this payout request.");
      return;
    }
    if (!usdcContractAddress) {
      setError("USDC contract address not configured.");
      return;
    }
    if (!isConnected) {
      setError("Please connect your wallet first.");
      return;
    }

    setError(null);
    setSending(true);
    try {
      const data = encodeFunctionData({
        abi: ERC20_TRANSFER_ABI,
        functionName: "transfer",
        args: [
          request.walletAddress as `0x${string}`,
          parseUnits(request.amount, 6),
        ],
      });

      const txHash = await sendTransactionAsync({
        to: usdcContractAddress,
        data,
      });

      await approvePayoutAction(request.id, txHash);
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transaction failed.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal open={!!request} onOpenChange={onOpenChange} title="Approve Payout">
      {request && (
        <div className="flex flex-col gap-5">
          <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: "#0B0F1A", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Partner</span>
              <span className="text-foreground font-medium">{request.userName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Amount</span>
              <span className="text-foreground font-bold">{formatUsd(request.amount)} USDC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">To Wallet</span>
              <span className="text-foreground font-mono text-xs">
                {request.walletAddress ? formatAddress(request.walletAddress) : <span className="text-danger">No wallet set</span>}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted">
            This will trigger a MetaMask transaction to send {formatUsd(request.amount)} USDC from your connected wallet to the partner&apos;s address.
          </p>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex gap-3">
            <Button
              variant="success"
              loading={sending}
              disabled={!request.walletAddress}
              onClick={handleSend}
              className="flex-1"
            >
              Send via MetaMask
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
