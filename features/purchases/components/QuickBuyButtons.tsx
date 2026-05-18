"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useChainId, useSwitchChain, useWaitForTransactionReceipt } from "wagmi";
import { mainnet } from "wagmi/chains";
import { parseUnits } from "viem";
import { Button } from "@/components/ui/Button";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { BuyConfirmModal } from "./BuyConfirmModal";
import { TransactionPendingModal } from "./TransactionPendingModal";
import { createBplayPurchaseAction, recordTxHashAction } from "@/features/purchases/actions";
import { QUICK_BUY_AMOUNTS, usdcToBplay, formatBplay } from "@/lib/exchange";

const ERC20_TRANSFER_ABI = [
  {
    name: "transfer",
    type: "function",
    inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

interface QuickBuyButtonsProps {
  rate: number;
  treasuryAddress: string;
  usdcContractAddress: string;
  transferAddress: string | null;
}

export function QuickBuyButtons({ rate, treasuryAddress, usdcContractAddress, transferAddress }: QuickBuyButtonsProps) {
  const recipient = (transferAddress ?? treasuryAddress) as `0x${string}`;
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

  const { isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({ hash: txHash, chainId: mainnet.id });

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const handleClose = () => {
    setPending(false);
    setTxHash(undefined);
  };

  const isWrongNetwork = isConnected && chainId !== mainnet.id;

  const handleConfirm = async (usdcAmount: number) => {
    if (!address) return;
    setConfirming(true);
    try {
      if (chainId !== mainnet.id) {
        await switchChainAsync({ chainId: mainnet.id });
      }
      const { purchaseId } = await createBplayPurchaseAction(usdcAmount, address, recipient);
      setSelectedAmount(null);
      setPending(true);
      const hash = await writeContractAsync({
        address: usdcContractAddress as `0x${string}`,
        abi: ERC20_TRANSFER_ABI,
        functionName: "transfer",
        args: [recipient, parseUnits(String(usdcAmount), 6)],
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

  if (!mounted) return null;

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-3 py-2">
        <p className="text-sm text-muted">Connect your wallet to buy BPLAY</p>
        <ConnectButton />
      </div>
    );
  }

  if (isWrongNetwork) {
    return (
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <p className="text-sm text-warning font-medium">Wrong network — please switch to Ethereum Mainnet to continue.</p>
        <Button loading={isSwitching} onClick={() => switchChainAsync({ chainId: mainnet.id })}>
          Switch to Mainnet
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {QUICK_BUY_AMOUNTS.map((amount) => (
          <Button
            key={amount}
            variant="outline"
            disabled={pending}
            onClick={() => setSelectedAmount(amount)}
            className="flex flex-col h-auto py-3 hover:border-primary hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
          >
            <span className="text-base font-bold">${amount} USDC</span>
            <span className="text-xs text-muted font-normal">{formatBplay(usdcToBplay(amount, rate))}</span>
          </Button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2">
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
              disabled={pending}
              className="w-full pl-7 pr-14 py-2.5 rounded-lg border border-card-border bg-bg text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">USDC</span>
          </div>
          <Button
            disabled={!isValidCustomAmount || pending}
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

      <BuyConfirmModal
        open={selectedAmount !== null}
        onOpenChange={(open) => { if (!open) setSelectedAmount(null); }}
        amount={selectedAmount}
        rate={rate}
        onConfirm={handleConfirm}
        loading={confirming}
      />
      <TransactionPendingModal open={pending} txHash={txHash} confirmed={isTxConfirmed} onClose={handleClose} />
    </>
  );
}
