"use client";

import { useState } from "react";
import { Wallet, Zap, RefreshCcw, Info } from "lucide-react";
import { useAccount, useWriteContract, useChainId, useSwitchChain, useWaitForTransactionReceipt } from "wagmi";
import { mainnet } from "wagmi/chains";
import { parseUnits } from "viem";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { Button } from "@/components/ui/Button";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { BuyConfirmModal } from "./BuyConfirmModal";
import { TransactionPendingModal } from "./TransactionPendingModal";
import { createBplayPurchaseAction, recordTxHashAction } from "@/features/purchases/actions";
import { QUICK_BUY_AMOUNTS, usdcToBplay, formatBplay } from "@/lib/exchange";
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
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customInput, setCustomInput] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const customUsdcAmount = parseFloat(customInput);
  const isValidCustomAmount = !isNaN(customUsdcAmount) && customUsdcAmount > 0;
  const isWrongNetwork = isConnected && chainId !== mainnet.id;

  const { isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({ hash: txHash, chainId: mainnet.id });

  const handleClose = () => {
    setPending(false);
    setTxHash(undefined);
  };

  const handleConfirm = async (usdcAmount: number) => {
    if (!address) return;
    setConfirming(true);
    try {
      if (chainId !== mainnet.id) {
        await switchChainAsync({ chainId: mainnet.id });
      }
      const { purchaseId } = await createBplayPurchaseAction(usdcAmount, address, recipientAddress);
      setSelectedAmount(null);
      setPending(true);
      const hash = await writeContractAsync({
        address: usdcContractAddress as `0x${string}`,
        abi: ERC20_TRANSFER_ABI,
        functionName: "transfer",
        args: [recipientAddress as `0x${string}`, parseUnits(String(usdcAmount), 6)],
        chainId: mainnet.id,
      });
      setTxHash(hash as `0x${string}`);
      await recordTxHashAction(purchaseId, hash);
    } catch {
      setPending(false);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Header */}
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

      {/* Deposit address */}
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

      {/* Quick buy */}
      <Card>
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-4 w-4 text-yellow-400" />
          <h3 className="text-sm font-bold text-foreground">Quick Buy</h3>
        </div>
        <p className="text-xs text-muted mb-4">
          Select an amount below. Your wallet will open with the transaction pre-filled.
        </p>

        {isWrongNetwork ? (
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <p className="text-sm text-warning font-medium">Wrong network — switch to Ethereum Mainnet to continue.</p>
            <Button loading={isSwitching} onClick={() => switchChainAsync({ chainId: mainnet.id })}>
              Switch to Mainnet
            </Button>
          </div>
        ) : (
          <>
            {/* Connect wallet prompt — shown above preset buttons when not connected */}
            {!isConnected && (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-5 py-5 mb-5 text-center">
                <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Connect your wallet to buy BPLAY</p>
                  <p className="text-xs text-muted mt-0.5">Use MetaMask or any Web3 wallet to pay with USDC</p>
                </div>
                <ConnectButton />
              </div>
            )}

            {/* Preset amounts — 4-column grid */}
            <div className="grid grid-cols-4 gap-3">
              {QUICK_BUY_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  disabled={!isConnected || pending || confirming}
                  onClick={() => setSelectedAmount(amount)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl border border-card-border bg-bg py-4 px-2 transition-all duration-150",
                    "hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.02]",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  )}
                >
                  <span className="text-lg font-bold text-foreground">${amount}</span>
                  <span className="text-xs text-muted mt-0.5">USDC</span>
                  <span className="text-[10px] text-primary mt-1 font-medium">
                    {formatBplay(usdcToBplay(amount, rate))}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <div className="mt-5 flex flex-col gap-2">
              <label className="text-xs font-medium text-muted uppercase tracking-wider">Custom Amount</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    disabled={!isConnected || pending || confirming}
                    className="w-full pl-7 pr-14 py-2.5 rounded-lg border border-card-border bg-bg text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">USDC</span>
                </div>
                <Button
                  disabled={!isConnected || !isValidCustomAmount || pending || confirming}
                  onClick={() => setSelectedAmount(customUsdcAmount)}
                  className="shrink-0"
                >
                  Buy
                </Button>
              </div>
              {isValidCustomAmount && (
                <p className="text-xs text-muted">
                  You will receive approximately{" "}
                  <span className="text-primary font-semibold">{formatBplay(usdcToBplay(customUsdcAmount, rate))}</span>
                </p>
              )}
            </div>
          </>
        )}
      </Card>

      {/* How it works */}
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
              desc: "Review the pre-filled USDC transfer in your wallet and confirm. The funds go directly to the BPLAY treasury.",
            },
            {
              step: "3",
              title: "Receive BPLAY tokens",
              desc: "Once the transaction is confirmed on-chain, BPLAY tokens are credited to your account within minutes.",
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
          You can also send USDC manually to the deposit address above from any wallet or exchange.
        </p>
        <p className="text-xs text-muted">
          Current rate:{" "}
          <strong className="text-foreground font-semibold">
            1 USDC = {rate > 0 ? rate.toFixed(2) : "—"} BPLAY
          </strong>
        </p>
      </div>

      <BuyConfirmModal
        open={selectedAmount !== null}
        onOpenChange={(open) => { if (!open) setSelectedAmount(null); }}
        amount={selectedAmount}
        rate={rate}
        onConfirm={handleConfirm}
        loading={confirming}
      />
      <TransactionPendingModal open={pending} txHash={txHash} confirmed={isTxConfirmed} onClose={handleClose} />
    </div>
  );
}
