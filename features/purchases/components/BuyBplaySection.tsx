"use client";

import { useState } from "react";
import { Wallet, Zap, RefreshCcw, Info } from "lucide-react";
import { useAccount, useSendTransaction } from "wagmi";
import { parseUnits, encodeFunctionData } from "viem";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { TransactionPendingModal } from "./TransactionPendingModal";
import { createBplayPurchaseAction, recordTxHashAction } from "@/features/purchases/actions";
import { QUICK_BUY_AMOUNTS } from "@/lib/exchange";
import { cn } from "@/lib/utils";

const ERC20_TRANSFER_ABI = [
  {
    name: "transfer",
    type: "function",
    inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

interface BuyBplaySectionProps {
  rate: number;
  recipientAddress: string;
  usdcContractAddress: string;
}

export function BuyBplaySection({ rate, recipientAddress, usdcContractAddress }: BuyBplaySectionProps) {
  const { address, isConnected } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const [pending, setPending] = useState(false);
  const [txHash, setTxHash] = useState<string>();
  const [loading, setLoading] = useState<number | null>(null);

  const handleBuy = async (usdcAmount: number) => {
    if (!address) return;
    setLoading(usdcAmount);
    try {
      const { purchaseId } = await createBplayPurchaseAction(usdcAmount, address, recipientAddress);
      const data = encodeFunctionData({
        abi: ERC20_TRANSFER_ABI,
        functionName: "transfer",
        args: [recipientAddress as `0x${string}`, parseUnits(String(usdcAmount), 6)],
      });
      setPending(true);
      const hash = await sendTransactionAsync({ to: usdcContractAddress as `0x${string}`, data });
      setTxHash(hash);
      await recordTxHashAction(purchaseId, hash);
    } catch {
      setPending(false);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
          <RefreshCcw className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Buy BPLAY Tokens</h2>
          <p className="text-sm text-muted mt-1">
            Send USDC to the address below to receive<br />BPLAY tokens at the current exchange rate
          </p>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-1">
          <Wallet className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-bold text-foreground">Deposit Address</h3>
        </div>
        <p className="text-xs text-muted mb-3">Send USDC (ERC-20) to this Ethereum address</p>
        <div className="flex items-center gap-2 rounded-lg border border-card-border bg-bg px-3 py-2.5 mb-3">
          <span className="text-sm font-mono text-muted flex-1 truncate">{recipientAddress}</span>
          <CopyButton text={recipientAddress} />
        </div>
        <div className="flex items-start gap-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-2.5">
          <Info className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-300 leading-relaxed">
            Only send <strong className="text-blue-200">USDC</strong> on the{" "}
            <strong className="text-blue-200">Ethereum network</strong>. Sending other tokens or using other
            networks may result in permanent loss of funds.
          </p>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-4 w-4 text-yellow-400" />
          <h3 className="text-sm font-bold text-foreground">Quick Buy</h3>
        </div>
        <p className="text-xs text-muted mb-4">
          Select an amount to send directly from your wallet. Your Web3 wallet will open with the
          transaction pre-filled.
        </p>
        {!isConnected ? (
          <div className="flex flex-col items-center gap-3 py-2">
            <p className="text-sm text-muted">Connect your wallet to buy BPLAY</p>
            <ConnectButton />
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {QUICK_BUY_AMOUNTS.map((amount) => (
              <button
                key={amount}
                disabled={pending || loading !== null}
                onClick={() => handleBuy(amount)}
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl border border-card-border bg-bg py-5 px-2 transition-all duration-150",
                  "hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.02]",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                  loading === amount && "border-primary/50 bg-primary/5"
                )}
              >
                <span className="text-xl font-bold text-foreground">${amount}</span>
                <span className="text-xs text-muted mt-0.5">USDC</span>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-bold text-foreground mb-4">How It Works</h3>
        <div className="flex flex-col gap-5">
          {[
            {
              step: "1",
              title: "Connect your wallet",
              desc: "Click one of the amount buttons above. Your MetaMask or Web3 wallet will prompt you to connect.",
            },
            {
              step: "2",
              title: "Confirm the transaction",
              desc: "Review the pre-filled USDC transfer in your wallet and confirm. The funds go directly to the BPLAY treasury address.",
            },
            {
              step: "3",
              title: "Receive BPLAY tokens",
              desc: "Once the transaction is confirmed on-chain, BPLAY tokens will be credited to your connected wallet within minutes.",
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4 items-start">
              <div className="h-8 w-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">{step}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="text-center space-y-0.5 pb-2">
        <p className="text-xs text-muted">
          You can also send USDC manually to the address above from any wallet or exchange.
        </p>
        <p className="text-xs text-muted">
          Current rate:{" "}
          <strong className="text-foreground font-semibold">1 USDC = {rate.toFixed(2)} BPLAY</strong>
        </p>
      </div>

      <TransactionPendingModal open={pending} txHash={txHash} />
    </div>
  );
}
