"use client";

import { useState } from "react";
import { useAccount, useSendTransaction } from "wagmi";
import { parseUnits, encodeFunctionData } from "viem";
import { Button } from "@/components/ui/Button";
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
  const { address } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [txHash, setTxHash] = useState<string>();

  const handleConfirm = async (usdcAmount: number) => {
    if (!address) return;
    setConfirming(true);
    try {
      const { purchaseId } = await createBplayPurchaseAction(usdcAmount, address, recipient);

      const data = encodeFunctionData({
        abi: ERC20_TRANSFER_ABI,
        functionName: "transfer",
        args: [recipient, parseUnits(String(usdcAmount), 6)],
      });

      setSelectedAmount(null);
      setPending(true);
      const hash = await sendTransactionAsync({
        to: usdcContractAddress as `0x${string}`,
        data,
      });

      setTxHash(hash);
      await recordTxHashAction(purchaseId, hash);
    } catch {
      setPending(false);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {QUICK_BUY_AMOUNTS.map((amount) => (
          <Button
            key={amount}
            variant="outline"
            disabled={pending}
            onClick={() => setSelectedAmount(amount)}
            className="flex flex-col h-auto py-3"
          >
            <span className="text-base font-bold">${amount} USDC</span>
            <span className="text-xs text-muted font-normal">{formatBplay(usdcToBplay(amount, rate))}</span>
          </Button>
        ))}
      </div>
      <BuyConfirmModal
        open={selectedAmount !== null}
        onOpenChange={(open) => { if (!open) setSelectedAmount(null); }}
        amount={selectedAmount}
        rate={rate}
        onConfirm={handleConfirm}
        loading={confirming}
      />
      <TransactionPendingModal open={pending} txHash={txHash} />
    </>
  );
}
