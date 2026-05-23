"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { updateExchangeRateAction } from "@/features/exchange-rate/actions";
import type { ExchangeRate } from "@/db/schema/exchange-rates";

export function ExchangeRateForm({ current }: { current: ExchangeRate | null }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pendingRate, setPendingRate] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: { preventDefault(): void; currentTarget: HTMLFormElement }) => {
    e.preventDefault();
    const form = e.currentTarget;
    const rate = (form.elements.namedItem("rate") as HTMLInputElement)?.value;
    setPendingRate(rate);
    setConfirming(true);
  };

  const handleConfirm = async () => {
    if (!formRef.current) return;
    setConfirming(false);
    setSubmitting(true);
    setErrorMsg(null);
    const formData = new FormData(formRef.current);
    const result = await updateExchangeRateAction(null, formData);
    setSubmitting(false);
    if (result && "error" in result) {
      setErrorMsg(result.error);
    } else {
      setSuccess(true);
      router.refresh();
    }
  };

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const currentDisplay = current && parseFloat(current.rate) > 0
    ? (1 / parseFloat(current.rate)).toFixed(6)
    : "";

  return (
    <>
      <Card>
        <h2 className="text-lg font-semibold text-foreground mb-1">Update Exchange Rate</h2>
        <p className="text-xs text-muted mb-4">Each update creates a new row — the history is preserved as an audit trail.</p>
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
          <Input
            name="rate"
            label="USDC Rate (per 1 BPLAY)"
            type="number"
            step="0.000001"
            min="0.000001"
            defaultValue={currentDisplay}
            placeholder="0.150000"
            required
          />
          {errorMsg && <p className="text-sm text-danger">{errorMsg}</p>}
          {success && <p className="text-sm text-success">Exchange rate updated successfully.</p>}
          <Button type="submit" loading={submitting} size="sm" className="self-start">Update Rate</Button>
        </form>
      </Card>

      <ConfirmDialog
        open={confirming}
        title="Change BPLAY exchange rate?"
        description={`Are you sure you want to change the BPLAY rate to ${pendingRate ?? ""} USDC per 1 BPLAY? All rate-dependent data will reflect the new rate immediately.`}
        confirmLabel="Update Rate"
        onConfirm={handleConfirm}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
