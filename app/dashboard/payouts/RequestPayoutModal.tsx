"use client";

import { useActionState, useState } from "react";
import { Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { requestPayoutAction } from "@/features/payouts/actions";

interface RequestPayoutModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  availableBalance: number;
  savedWallet: string | null;
}

export function RequestPayoutModal({ open, onOpenChange, availableBalance, savedWallet }: RequestPayoutModalProps) {
  const [state, action, pending] = useActionState(requestPayoutAction, null);
  const [editingWallet, setEditingWallet] = useState(false);

  const showSavedWallet = !!savedWallet && !editingWallet;

  return (
    <Modal
      open={open}
      onOpenChange={(v) => {
        if (!v) setEditingWallet(false);
        onOpenChange(v);
      }}
      title="Request Payout"
      description={`Available balance: $${availableBalance.toFixed(2)}`}
    >
      <form action={action} className="flex flex-col gap-4">
        <Input
          name="amount"
          type="number"
          label="Amount (USD)"
          placeholder="0.00"
          min="0.01"
          max={availableBalance}
          step="0.01"
          required
        />

        <input type="hidden" name="payoutMethod" value="USDC" />

        {showSavedWallet ? (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted uppercase tracking-wider">USDC Wallet Address</label>
            <div
              className="flex items-center justify-between px-3 py-2.5 rounded-lg"
              style={{ background: "#0B0F1A", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span className="font-mono text-xs text-foreground truncate">{savedWallet}</span>
              <button
                type="button"
                onClick={() => setEditingWallet(true)}
                className="ml-2 shrink-0 text-muted hover:text-primary transition-colors"
                title="Edit wallet address"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-xs text-muted">This is your connected wallet. Click the pencil to use a different address.</p>
            <input type="hidden" name="walletAddress" value={savedWallet} />
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <Input
              name="walletAddress"
              label="USDC Wallet Address"
              placeholder="0x..."
              defaultValue={savedWallet ?? ""}
              required
            />
            {savedWallet && (
              <button
                type="button"
                onClick={() => setEditingWallet(false)}
                className="text-xs text-primary hover:underline self-start"
              >
                ← Use saved wallet
              </button>
            )}
          </div>
        )}

        {state && "error" in state && state.error && (
          <p className="text-sm text-danger">{state.error}</p>
        )}
        {state && "success" in state && (
          <p className="text-sm text-success">Payout request submitted! The super admin will review it shortly.</p>
        )}

        <Button type="submit" loading={pending} className="w-full">
          Submit Request
        </Button>
      </form>
    </Modal>
  );
}
