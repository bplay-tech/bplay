"use client";

import { useActionState, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { requestPayoutAction } from "@/features/payouts/actions";

const METHOD_OPTIONS = [
  { value: "USDC", label: "USDC" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
];

interface RequestPayoutModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  availableBalance: number;
}

export function RequestPayoutModal({ open, onOpenChange, availableBalance }: RequestPayoutModalProps) {
  const [state, action, pending] = useActionState(requestPayoutAction, null);
  const [method, setMethod] = useState("USDC");

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Request Payout" description={`Available balance: $${availableBalance.toFixed(2)}`}>
      <form action={action} className="flex flex-col gap-4">
        <Input name="amount" type="number" label="Amount (USD)" placeholder="50.00" min="50" max={availableBalance} step="0.01" required />
        <Select label="Payout Method" value={method} onValueChange={setMethod} options={METHOD_OPTIONS} />
        <input type="hidden" name="payoutMethod" value={method} />
        {method === "USDC" && (
          <Input name="walletAddress" label="Wallet Address" placeholder="0x..." required />
        )}
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
