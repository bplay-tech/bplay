"use client";

import { useAccount } from "wagmi";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { formatAddress } from "@/lib/utils";
import { formatBplay, usdcToBplay } from "@/lib/exchange";

interface BuyConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number | null;
  rate: number;
  onConfirm: (amount: number) => void;
  loading: boolean;
  partnerCommissionRate?: number;
}

function WalletConnectStep({ amount, bplayAmount }: { amount: number; bplayAmount: string }) {
  return (
    <div className="flex flex-col items-center gap-5 py-2">
      <div className="h-16 w-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-4xl select-none">
        🦊
      </div>
      <div className="text-center">
        <p className="text-sm text-muted">Connect your MetaMask wallet to complete this purchase</p>
        <p className="mt-2 text-base font-bold text-foreground">
          ${amount} USDC → {bplayAmount} BPLAY
        </p>
      </div>
      <ConnectButton />
    </div>
  );
}

function OrderSummaryStep({
  amount,
  bplayAmount,
  address,
  onConfirm,
  loading,
  partnerCommissionRate,
}: {
  amount: number;
  bplayAmount: string;
  address: string;
  onConfirm: () => void;
  loading: boolean;
  partnerCommissionRate?: number;
}) {
  const provisionAmount = partnerCommissionRate != null
    ? ((amount * partnerCommissionRate) / 100).toFixed(2)
    : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg bg-bg border border-card-border p-4 flex flex-col gap-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted">You pay</span>
          <span className="font-semibold text-foreground">${amount} USDC</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">You receive</span>
          <span className="font-semibold text-primary">{bplayAmount} BPLAY</span>
        </div>
        {provisionAmount && (
          <div className="flex justify-between text-sm">
            <span className="text-muted">Partner provision</span>
            <span className="font-medium text-amber-400">${provisionAmount} ({partnerCommissionRate}%)</span>
          </div>
        )}
        <div className="border-t border-card-border pt-3 flex justify-between text-sm">
          <span className="text-muted">From wallet</span>
          <span className="font-mono text-xs text-foreground">{formatAddress(address)}</span>
        </div>
      </div>
      <div className="rounded-lg bg-warning/10 border border-warning/30 px-3 py-2">
        <p className="text-xs text-warning">
          MetaMask will open to confirm the transaction. Do not close this page.
        </p>
      </div>
      <Button loading={loading} onClick={onConfirm} className="w-full">
        Confirm Payment
      </Button>
    </div>
  );
}

export function BuyConfirmModal({
  open,
  onOpenChange,
  amount,
  rate,
  onConfirm,
  loading,
  partnerCommissionRate,
}: BuyConfirmModalProps) {
  const { address, isConnected } = useAccount();

  if (!amount) return null;

  const bplayAmount = formatBplay(usdcToBplay(amount, rate));

  if (!isConnected) {
    return (
      <Modal open={open} onOpenChange={onOpenChange} title="Connect Wallet">
        <WalletConnectStep amount={amount} bplayAmount={bplayAmount} />
      </Modal>
    );
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Confirm Purchase">
      <OrderSummaryStep
        amount={amount}
        bplayAmount={bplayAmount}
        address={address!}
        onConfirm={() => onConfirm(amount)}
        loading={loading}
        partnerCommissionRate={partnerCommissionRate}
      />
    </Modal>
  );
}
