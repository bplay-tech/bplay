"use client";

import { useActionState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { requestPayoutAction } from "@/features/payouts/actions";

interface RequestPayoutModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  availableBalance: number;
}

export function RequestPayoutModal({ open, onOpenChange, availableBalance }: RequestPayoutModalProps) {
  const [state, action, pending] = useActionState(requestPayoutAction, null);

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Request Payout" description={`Available balance: $${availableBalance.toFixed(2)}`}>
      <form action={action} className="flex flex-col gap-4">
        <Input name="amount" type="number" label="Amount (USD)" placeholder="0.00" min="0.01" max={availableBalance} step="0.01" required />
        <input type="hidden" name="payoutMethod" value="USDC" />
        <Input name="walletAddress" label="USDC Wallet Address" placeholder="0x..." required />
        {state && "error" in state && state.error && (
          <p className="text-sm text-danger">{state.error}</p>
        )}
        {state && "success" in state && (
          <p className="text-sm text-success">Payout request submitted!</p>
        )}
        <Button type="submit" loading={pending} className="w-full">
          Submit Request
        </Button>
      </form>
    </Modal>
  );
}
