"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { parseUnits } from "viem";
import { ExternalLink, CheckCircle2 } from "lucide-react";
import { mainnet } from "wagmi/chains";
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
  const { address, isConnected } = useAccount();
  const { open: openAppKit } = useAppKit();
  const { writeContractAsync } = useWriteContract();
  const [sending, setSending] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);

  const usdcContractAddress = process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS as `0x${string}` | undefined;

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash ?? undefined,
    chainId: mainnet.id,
  });

  useEffect(() => {
    if (!isConfirmed) return;
    const t = setTimeout(() => onOpenChange(false), 1800);
    return () => clearTimeout(t);
  }, [isConfirmed, onOpenChange]);

  const handleSend = async () => {
    if (!request?.walletAddress) {
      setError("No wallet address on this payout request.");
      return;
    }
    if (!usdcContractAddress) {
      setError("USDC contract address is not configured (NEXT_PUBLIC_USDC_CONTRACT_ADDRESS).");
      return;
    }

    setError(null);
    setSending(true);
    try {
      const hash = await writeContractAsync({
        address: usdcContractAddress,
        abi: ERC20_TRANSFER_ABI,
        functionName: "transfer",
        args: [request.walletAddress as `0x${string}`, parseUnits(request.amount, 6)],
        chainId: mainnet.id,
      });
      setTxHash(hash);
      await approvePayoutAction(request.id, hash);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transaction failed. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (sending) return;
    setError(null);
    setTxHash(null);
    onOpenChange(false);
  };

  return (
    <Modal open={!!request} onOpenChange={handleClose} title="Approve Payout">
      {request && (
        <div className="flex flex-col gap-5">
          <div
            className="rounded-xl p-4 flex flex-col gap-3"
            style={{ background: "#0B0F1A", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <Row label="Partner" value={request.userName} />
            <Row label="Amount" value={`${formatUsd(request.amount)} USDC`} bold />
            <Row
              label="To Wallet"
              value={
                request.walletAddress
                  ? <span className="font-mono text-xs">{formatAddress(request.walletAddress)}</span>
                  : <span className="text-danger text-xs">No wallet set</span>
              }
            />
            <Row
              label="From Wallet"
              value={
                isConnected && address
                  ? <span className="font-mono text-xs">{formatAddress(address)}</span>
                  : <span className="text-yellow-400 text-xs">Not connected</span>
              }
            />
          </div>

          {!isConnected && (
            <div
              className="rounded-lg px-4 py-3 flex items-center justify-between gap-3"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}
            >
              <p className="text-xs text-yellow-400">Connect your wallet to send USDC</p>
              <Button size="sm" variant="outline" onClick={() => openAppKit()}>
                Connect Wallet
              </Button>
            </div>
          )}

          {isConfirmed ? (
            <div
              className="rounded-lg px-4 py-3 flex items-center gap-3"
              style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}
            >
              <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
              <p className="text-xs text-success font-medium">Transaction confirmed — payout approved. Closing…</p>
            </div>
          ) : (
            <p className="text-xs text-muted">
              This will open your wallet to send {formatUsd(request.amount)} USDC to the partner. The transaction is recorded on-chain.
            </p>
          )}

          {error && <p className="text-sm text-danger">{error}</p>}

          {txHash && (
            <a
              href={`https://etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View on Etherscan <ExternalLink className="h-3 w-3" />
            </a>
          )}

          {!isConfirmed && (
            <div className="flex gap-3">
              <Button
                variant="success"
                loading={sending}
                disabled={!isConnected || !request.walletAddress || !!txHash}
                onClick={handleSend}
                className="flex-1"
              >
                {sending ? "Waiting for wallet…" : txHash ? "Transaction submitted…" : `Send ${formatUsd(request.amount)} USDC`}
              </Button>
              <Button variant="outline" onClick={handleClose} disabled={sending}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function Row({ label, value, bold }: { label: string; value: React.ReactNode; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted">{label}</span>
      <span className={bold ? "text-foreground font-bold" : "text-foreground"}>{value}</span>
    </div>
  );
}
