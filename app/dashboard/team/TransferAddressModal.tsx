"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateTransferAddressAction } from "@/features/team/actions";

interface TransferAddressModalProps {
  userId: string;
  currentAddress: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function TransferAddressModal({ userId, currentAddress, open, onOpenChange }: TransferAddressModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setPending(true);
    const data = new FormData(e.currentTarget);
    const address = data.get("address") as string;
    const result = await updateTransferAddressAction(userId, address);
    setPending(false);
    if ("error" in result) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => onOpenChange(false), 800);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Set Transfer Address">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          name="address"
          label="Ethereum Address"
          placeholder="0x... (leave blank to clear)"
          defaultValue={currentAddress ?? ""}
        />
        <p className="text-xs text-muted">
          When set, USDC purchases by this user will be sent to this address instead of the default treasury.
        </p>
        {error && <p className="text-sm text-danger">{error}</p>}
        {success && <p className="text-sm text-success">Transfer address updated.</p>}
        <Button type="submit" loading={pending} className="w-full">Save</Button>
      </form>
    </Modal>
  );
}
