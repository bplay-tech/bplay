"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateExchangeRateAction } from "@/features/exchange-rate/actions";
import type { ExchangeRate } from "@/db/schema/exchange-rates";

export function ExchangeRateForm({ current }: { current: ExchangeRate | null }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(updateExchangeRateAction, null);

  useEffect(() => {
    if (state && "success" in state) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <Card>
      <h2 className="text-lg font-semibold text-foreground mb-1">Update Exchange Rate</h2>
      <p className="text-xs text-muted mb-4">Each update creates a new row — the history is preserved as an audit trail.</p>
      <form action={action} className="flex flex-col gap-4 max-w-sm">
        <Input
          name="rate"
          label="USDC Rate (per 1 BPLAY)"
          type="number"
          step="0.000001"
          min="0.000001"
          defaultValue={current && parseFloat(current.rate) > 0 ? (1 / parseFloat(current.rate)).toFixed(6) : ""}
          placeholder="0.150000"
          required
        />
        {state && "error" in state && <p className="text-sm text-danger">{state.error}</p>}
        {state && "success" in state && <p className="text-sm text-success">Exchange rate updated successfully.</p>}
        <Button type="submit" loading={pending} size="sm" className="self-start">Update Rate</Button>
      </form>
    </Card>
  );
}
